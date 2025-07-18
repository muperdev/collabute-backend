export class PermissionUtil {
  /**
   * Check if user has a specific permission
   */
  static hasPermission(userRole: any, permission: string): boolean {
    if (!userRole || !userRole.permissions) {
      return false;
    }

    const permissions = userRole.permissions;

    // Handle both array and object permission formats
    if (Array.isArray(permissions)) {
      return permissions.includes(permission);
    } else if (typeof permissions === 'object') {
      return permissions[permission] === true;
    }

    return false;
  }

  /**
   * Check if user has any of the specified permissions
   */
  static hasAnyPermission(userRole: any, permissions: string[]): boolean {
    return permissions.some((permission) =>
      this.hasPermission(userRole, permission),
    );
  }

  /**
   * Check if user has all of the specified permissions
   */
  static hasAllPermissions(userRole: any, permissions: string[]): boolean {
    return permissions.every((permission) =>
      this.hasPermission(userRole, permission),
    );
  }

  /**
   * Check if user has admin role
   */
  static isAdmin(userRole: any): boolean {
    return userRole?.name === 'admin';
  }

  /**
   * Check if user has specific role
   */
  static hasRole(userRole: any, roleName: string): boolean {
    return userRole?.name === roleName;
  }

  /**
   * Check if user has any of the specified roles
   */
  static hasAnyRole(userRole: any, roleNames: string[]): boolean {
    return roleNames.some((roleName) => this.hasRole(userRole, roleName));
  }

  /**
   * Check if user can access resource based on ownership
   */
  static canAccessResource(
    userId: string,
    resourceOwnerId: string,
    userRole: any,
  ): boolean {
    // Owner can access
    if (userId === resourceOwnerId) {
      return true;
    }

    // Admin can access everything
    if (this.isAdmin(userRole)) {
      return true;
    }

    return false;
  }

  /**
   * Check if user can modify resource based on ownership and permissions
   */
  static canModifyResource(
    userId: string,
    resourceOwnerId: string,
    userRole: any,
    requiredPermission?: string,
  ): boolean {
    // Owner can modify
    if (userId === resourceOwnerId) {
      return true;
    }

    // Admin can modify everything
    if (this.isAdmin(userRole)) {
      return true;
    }

    // Check specific permission if provided
    if (requiredPermission) {
      return this.hasPermission(userRole, requiredPermission);
    }

    return false;
  }

  /**
   * Get user's effective permissions (including role-based permissions)
   */
  static getEffectivePermissions(userRole: any): string[] {
    if (!userRole || !userRole.permissions) {
      return [];
    }

    const permissions = userRole.permissions;

    if (Array.isArray(permissions)) {
      return permissions;
    } else if (typeof permissions === 'object') {
      return Object.keys(permissions).filter(
        (key) => permissions[key] === true,
      );
    }

    return [];
  }

  /**
   * Common permission constants
   */
  static readonly PERMISSIONS = {
    USER_CREATE: 'user.create',
    USER_READ: 'user.read',
    USER_UPDATE: 'user.update',
    USER_DELETE: 'user.delete',
    PROJECT_CREATE: 'project.create',
    PROJECT_READ: 'project.read',
    PROJECT_UPDATE: 'project.update',
    PROJECT_DELETE: 'project.delete',
    ISSUE_CREATE: 'issue.create',
    ISSUE_READ: 'issue.read',
    ISSUE_UPDATE: 'issue.update',
    ISSUE_DELETE: 'issue.delete',
    ADMIN_ACCESS: 'admin.access',
    QUEUE_MANAGE: 'queue.manage',
    SYSTEM_CONFIG: 'system.config',
  } as const;

  /**
   * Common role constants
   */
  static readonly ROLES = {
    ADMIN: 'admin',
    MODERATOR: 'moderator',
    USER: 'user',
    GUEST: 'guest',
  } as const;
}
