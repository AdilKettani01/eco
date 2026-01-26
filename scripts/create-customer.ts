import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'cliente@ecolimpio.es';
  const password = 'cliente123';
  const name = 'Cliente Demo';

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log('❌ Customer user already exists!');
    console.log('Email:', email);
    return;
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create customer user
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role: 'CUSTOMER',
    },
  });

  console.log('✅ Customer user created successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('Name:', name);
  console.log('Role:', 'CUSTOMER');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('Error creating customer user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
