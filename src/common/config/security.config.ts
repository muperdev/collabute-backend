export const SecurityConfig = {
  /**
   * Default admin role configuration
   */
  DEFAULT_ADMIN_ROLE: {
    name: 'admin',
    displayName: 'Administrator',
    description: 'Full system access',
    permissions: {
      'user.create': true,
      'user.read': true,
      'user.update': true,
      'user.delete': true,
      'project.create': true,
      'project.read': true,
      'project.update': true,
      'project.delete': true,
      'issue.create': true,
      'issue.read': true,
      'issue.update': true,
      'issue.delete': true,
      'admin.access': true,
      'queue.manage': true,
      'system.config': true,
    },
  },

  /**
   * Default user role configuration
   */
  DEFAULT_USER_ROLE: {
    name: 'user',
    displayName: 'User',
    description: 'Standard user access',
    permissions: {
      'project.create': true,
      'project.read': true,
      'issue.create': true,
      'issue.read': true,
    },
  },

  /**
   * Default moderator role configuration
   */
  DEFAULT_MODERATOR_ROLE: {
    name: 'moderator',
    displayName: 'Moderator',
    description: 'Moderate content and users',
    permissions: {
      'user.read': true,
      'project.read': true,
      'project.update': true,
      'issue.read': true,
      'issue.update': true,
      'issue.delete': true,
    },
  },

  /**
   * Resource-specific permissions
   */
  RESOURCE_PERMISSIONS: {
    PROJECT: {
      CREATE: 'project.create',
      READ: 'project.read',
      UPDATE: 'project.update',
      DELETE: 'project.delete',
    },
    USER: {
      CREATE: 'user.create',
      READ: 'user.read',
      UPDATE: 'user.update',
      DELETE: 'user.delete',
    },
    ISSUE: {
      CREATE: 'issue.create',
      READ: 'issue.read',
      UPDATE: 'issue.update',
      DELETE: 'issue.delete',
    },
    ADMIN: {
      ACCESS: 'admin.access',
      QUEUE_MANAGE: 'queue.manage',
      SYSTEM_CONFIG: 'system.config',
    },
  },

  /**
   * Role hierarchy (higher number = more privileges)
   */
  ROLE_HIERARCHY: {
    guest: 0,
    user: 1,
    moderator: 2,
    admin: 3,
  },

  /**
   * Security settings
   */
  SECURITY_SETTINGS: {
    JWT_EXPIRES_IN: '7d',
    REFRESH_TOKEN_EXPIRES_IN: '30d',
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_REQUIRE_UPPERCASE: true,
    PASSWORD_REQUIRE_LOWERCASE: true,
    PASSWORD_REQUIRE_NUMBERS: true,
    PASSWORD_REQUIRE_SYMBOLS: true,
  },

  /**
   * Rate limiting configuration
   */
  RATE_LIMITS: {
    LOGIN: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 attempts per window
    },
    API_GENERAL: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // 100 requests per window
    },
    FILE_UPLOAD: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 50, // 50 uploads per hour
    },
  },

  /**
   * File upload security
   */
  FILE_UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_MIME_TYPES: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/json',
    ],
    ALLOWED_EXTENSIONS: [
      'jpg',
      'jpeg',
      'png',
      'gif',
      'webp',
      'pdf',
      'txt',
      'json',
    ],
  },
};
