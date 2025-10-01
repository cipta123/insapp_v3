const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPrisma() {
  try {
    console.log('🧪 Testing Prisma Client...');
    
    // Test if InstagramUser model exists
    console.log('📋 Available models:', Object.keys(prisma));
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected');
    
    // Test queries
    const users = await prisma.instagramUser.findMany();
    console.log('👥 Users found:', users.length);
    
    const posts = await prisma.instagramPost.findMany();
    console.log('📝 Posts found:', posts.length);
    
    const comments = await prisma.instagramComment.findMany();
    console.log('💬 Comments found:', comments.length);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testPrisma();
