import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PermissionUtil } from '../../common/utils/permission.util';
import { validateAndParseId, validateAndParseIds } from '../../common/utils/id-validation.util';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    const parsedId = validateAndParseId(id);

    return this.prisma.role.findUnique({
      where: { id: parsedId },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findByName(name: string) {
    return this.prisma.role.findUnique({
      where: { name },
    });
  }

  async getDefaultRole() {
    return this.prisma.role.findUnique({
      where: { name: 'user' },
    });
  }

  async getAdminRole() {
    return this.prisma.role.findUnique({
      where: { name: 'admin' },
    });
  }

  async getUserPermissions(userId: string) {
    const parsedUserId = validateAndParseId(userId, 'userId');

    const user = await this.prisma.user.findUnique({
      where: { id: parsedUserId },
      include: { role: true },
    });

    if (!user?.role) {
      return [];
    }

    return PermissionUtil.getEffectivePermissions(user.role);
  }

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const parsedUserId = validateAndParseId(userId, 'userId');

    const user = await this.prisma.user.findUnique({
      where: { id: parsedUserId },
      include: { role: true },
    });

    if (!user?.role) {
      return false;
    }

    return PermissionUtil.hasPermission(user.role, permission);
  }

  async isAdmin(userId: string): Promise<boolean> {
    const parsedUserId = validateAndParseId(userId, 'userId');

    const user = await this.prisma.user.findUnique({
      where: { id: parsedUserId },
      include: { role: true },
    });

    return PermissionUtil.isAdmin(user?.role);
  }

  async assignRole(userId: string, roleId: string) {
    const [parsedUserId, parsedRoleId] = validateAndParseIds([
      { id: userId, fieldName: 'userId' },
      { id: roleId, fieldName: 'roleId' },
    ]);

    return this.prisma.user.update({
      where: { id: parsedUserId },
      data: { roleId: parsedRoleId },
      include: { role: true },
    });
  }

  async assignRoleByName(userId: string, roleName: string) {
    const role = await this.findByName(roleName);
    if (!role) {
      throw new Error(`Role '${roleName}' not found`);
    }

    return this.assignRole(userId, role.id.toString());
  }

  async getRoleStats() {
    const roles = await this.prisma.role.findMany({
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      displayName: role.displayName,
      userCount: role._count.users,
      isActive: role.isActive,
    }));
  }
}
