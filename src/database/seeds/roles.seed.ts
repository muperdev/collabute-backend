import { PrismaClient } from '@prisma/client';
import { SecurityConfig } from '../../common/config/security.config';

const prisma = new PrismaClient();

export async function seedRoles() {
  console.log('🌱 Seeding roles...');

  try {
    // Define roles with their permissions
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

    // Upsert roles (create if not exists, update if exists)
    for (const roleData of roles) {
      const role = await prisma.role.upsert({
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

      console.log(`✅ Role '${role.name}' created/updated successfully`);
    }

    console.log('🎉 Roles seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding roles:', error);
    throw error;
  }
}

// Run the seed if this file is executed directly
if (require.main === module) {
  seedRoles()
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}
