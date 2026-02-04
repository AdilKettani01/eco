import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function resetAdminPassword() {
  const newPassword = 'Ec0L!mp10_Adm1n#c79f8a8b';

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!admin) {
    console.error('No admin user found');
    process.exit(1);
  }

  await prisma.user.update({
    where: { id: admin.id },
    data: { passwordHash: hashedPassword }
  });

  // Delete all existing sessions for security
  await prisma.session.deleteMany({
    where: { userId: admin.id }
  });

  console.log(`Admin password reset for: ${admin.email}`);
  console.log(`New password: ${newPassword}`);
}

resetAdminPassword()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
