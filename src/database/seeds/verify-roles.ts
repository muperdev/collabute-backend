import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyRoles() {
  console.log('🔍 Verifying roles in database...');

  try {
    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    console.log('\n📊 Roles found:');
    console.log('================');

    if (roles.length === 0) {
      console.log('❌ No roles found in database');
      return;
    }

    roles.forEach((role) => {
      console.log(`\n🏷️  Role: ${role.name}`);
      console.log(`   Display Name: ${role.displayName}`);
      console.log(`   Description: ${role.description}`);
      console.log(`   Users with this role: ${role._count.users}`);
      console.log(`   Active: ${role.isActive}`);
      console.log(
        `   Permissions: ${JSON.stringify(role.permissions, null, 2)}`,
      );
    });

    console.log(`\n✅ Total roles found: ${roles.length}`);

    // Check if we have the expected roles
    const expectedRoles = ['admin', 'moderator', 'user', 'guest'];
    const foundRoleNames = roles.map((r) => r.name);
    const missingRoles = expectedRoles.filter(
      (role) => !foundRoleNames.includes(role),
    );

    if (missingRoles.length > 0) {
      console.log(`⚠️  Missing roles: ${missingRoles.join(', ')}`);
    } else {
      console.log('✅ All expected roles are present!');
    }
  } catch (error) {
    console.error('❌ Error verifying roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyRoles();
