import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import * as readline from 'readline';

const prisma = new PrismaClient();

function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres.');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una mayúscula.');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una minúscula.');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('La contraseña debe contener al menos un número.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

async function prompt(question: string, hidden: boolean = false): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  EcoLimpio - Create Admin User');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  // Get email from args or prompt
  let email = process.argv[2];
  if (!email) {
    email = await prompt('Email: ');
  }

  if (!email || !email.includes('@')) {
    console.error('❌ Invalid email address');
    process.exit(1);
  }

  // Get name from args or prompt
  let name = process.argv[3];
  if (!name) {
    name = await prompt('Name: ');
  }

  if (!name || name.length < 2) {
    console.error('❌ Name is required');
    process.exit(1);
  }

  // Get password from args or prompt
  let password = process.argv[4];
  if (!password) {
    console.log('');
    console.log('Password requirements:');
    console.log('  - At least 8 characters');
    console.log('  - At least one uppercase letter');
    console.log('  - At least one lowercase letter');
    console.log('  - At least one number');
    console.log('');
    password = await prompt('Password: ');
  }

  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    console.error('');
    console.error('❌ Invalid password:');
    passwordValidation.errors.forEach((err) => console.error(`   - ${err}`));
    process.exit(1);
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    console.log('');
    console.log('❌ User with this email already exists!');
    console.log('Email:', email);
    process.exit(1);
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create admin user
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      name,
      role: 'ADMIN',
    },
  });

  console.log('');
  console.log('✅ Admin user created successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Email:', user.email);
  console.log('Name:', user.name);
  console.log('Role:', user.role);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('Error creating admin user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
