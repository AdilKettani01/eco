import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateSessions() {
  console.log('Starting session migration...');

  try {
    // Clear all sessions - users will need to log in again with new hash-based URLs
    const deleted = await prisma.session.deleteMany({});
    console.log(`✓ Deleted ${deleted.count} existing sessions`);
    console.log('✓ Users will need to log in again with new hash-based URLs');
    console.log('✓ Migration completed successfully');
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateSessions();
