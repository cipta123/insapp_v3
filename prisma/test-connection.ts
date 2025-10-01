import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful!');

    const count = await prisma.instagramMessage.count();
    console.log(`✅ Found ${count} records in the InstagramMessage table.`);

  } catch (error) {
    console.error('❌ Failed to connect to the database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
