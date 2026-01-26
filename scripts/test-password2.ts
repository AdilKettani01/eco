import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@ecolimpio.es';
  const testPassword = 'AdminPass123';

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log('❌ User not found');
    process.exit(1);
  }

  const isValid = await bcrypt.compare(testPassword, user.passwordHash);

  console.log('Email:', user.email);
  console.log('Password "AdminPass123" is valid:', isValid ? '✅ YES' : '❌ NO');

  // Also test the original password
  const isValid2 = await bcrypt.compare('Admin123!', user.passwordHash);
  console.log('Password "Admin123!" is valid:', isValid2 ? '✅ YES' : '❌ NO');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
