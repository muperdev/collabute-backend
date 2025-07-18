import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.getAllAndOverride<string>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermission) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    if (!user.role || !user.role.permissions) {
      throw new ForbiddenException('No permissions assigned');
    }

    const permissions = user.role.permissions as string[] | { [key: string]: boolean };
    
    // Handle both array and object permission formats
    if (Array.isArray(permissions)) {
      return permissions.includes(requiredPermission);
    } else {
      return permissions[requiredPermission] === true;
    }
  }
}