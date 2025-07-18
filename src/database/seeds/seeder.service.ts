import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SecurityConfig } from '../../common/config/security.config';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(private prisma: PrismaService) {}

  async seedRoles() {
    this.logger.log('🌱 Starting role seeding...');

    try {
      const roles = [
        {
          name: SecurityConfig.DEFAULT_ADMIN_ROLE.name,
          displayName: SecurityConfig.DEFAULT_ADMIN_ROLE.displayName,
          description: SecurityConfig.DEFAULT_ADMIN_ROLE.description,
          permissions: SecurityConfig.DEFAULT_ADMIN_ROLE.permissions,
          isActive: true,
        },
        {
          name: SecurityConfig.DEFAULT_MODERATOR_ROLE.name,
          displayName: SecurityConfig.DEFAULT_MODERATOR_ROLE.displayName,
          description: SecurityConfig.DEFAULT_MODERATOR_ROLE.description,
          permissions: SecurityConfig.DEFAULT_MODERATOR_ROLE.permissions,
          isActive: true,
        },
        {
          name: SecurityConfig.DEFAULT_USER_ROLE.name,
          displayName: SecurityConfig.DEFAULT_USER_ROLE.displayName,
          description: SecurityConfig.DEFAULT_USER_ROLE.description,
          permissions: SecurityConfig.DEFAULT_USER_ROLE.permissions,
          isActive: true,
        },
        {
          name: 'guest',
          displayName: 'Guest',
          description: 'Limited access for non-authenticated users',
          permissions: {},
          isActive: true,
        },
      ];

      for (const roleData of roles) {
        const role = await this.prisma.role.upsert({
          where: { name: roleData.name },
          update: {
            displayName: roleData.displayName,
            description: roleData.description,
            permissions: roleData.permissions,
            isActive: roleData.isActive,
          },
          create: {
            name: roleData.name,
            displayName: roleData.displayName,
            description: roleData.description,
            permissions: roleData.permissions,
            isActive: roleData.isActive,
          },
        });

        this.logger.log(`✅ Role '${role.name}' created/updated successfully`);
      }

      this.logger.log('🎉 Role seeding completed successfully!');
      return { success: true, message: 'Roles seeded successfully' };
    } catch (error) {
      this.logger.error('❌ Error seeding roles:', error);
      throw error;
    }
  }

  async seedAdminUser(adminData: {
    email: string;
    name: string;
    password: string;
  }) {
    this.logger.log('🌱 Creating admin user...');

    try {
      // Get admin role
      const adminRole = await this.prisma.role.findUnique({
        where: { name: 'admin' },
      });

      if (!adminRole) {
        throw new Error('Admin role not found. Please run role seeding first.');
      }

      // Check if admin user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: adminData.email },
      });

      if (existingUser) {
        this.logger.warn(`Admin user with email ${adminData.email} already exists`);
        return { success: false, message: 'Admin user already exists' };
      }

      // Create admin user
      const adminUser = await this.prisma.user.create({
        data: {
          email: adminData.email,
          name: adminData.name,
          password: adminData.password, // Should be hashed in real implementation
          roleId: adminRole.id,
          isVerified: true,
          kycStatus: 'VERIFIED',
        },
        include: {
          role: true,
        },
      });

      this.logger.log(`✅ Admin user created successfully: ${adminUser.email}`);
      return { success: true, message: 'Admin user created successfully', user: adminUser };
    } catch (error) {
      this.logger.error('❌ Error creating admin user:', error);
      throw error;
    }
  }

  async assignDefaultRoleToUsers() {
    this.logger.log('🌱 Assigning default role to existing users...');

    try {
      // Get default user role
      const userRole = await this.prisma.role.findUnique({
        where: { name: 'user' },
      });

      if (!userRole) {
        throw new Error('User role not found. Please run role seeding first.');
      }

      // Find users without roles
      const usersWithoutRoles = await this.prisma.user.findMany({
        where: {
          roleId: null,
        },
      });

      if (usersWithoutRoles.length === 0) {
        this.logger.log('✅ All users already have roles assigned');
        return { success: true, message: 'All users already have roles' };
      }

      // Assign default role to users without roles
      const updateResult = await this.prisma.user.updateMany({
        where: {
          roleId: null,
        },
        data: {
          roleId: userRole.id,
        },
      });

      this.logger.log(`✅ Assigned default role to ${updateResult.count} users`);
      return { success: true, message: `Assigned default role to ${updateResult.count} users` };
    } catch (error) {
      this.logger.error('❌ Error assigning default roles:', error);
      throw error;
    }
  }

  async seedAll() {
    this.logger.log('🌱 Starting complete database seeding...');

    try {
      // Seed roles first
      await this.seedRoles();

      // Assign default roles to existing users
      await this.assignDefaultRoleToUsers();

      this.logger.log('🎉 Complete database seeding finished successfully!');
      return { success: true, message: 'Database seeded successfully' };
    } catch (error) {
      this.logger.error('❌ Error during complete seeding:', error);
      throw error;
    }
  }
}