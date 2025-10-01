import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET() {
  console.log('🔥 API_MESSAGES: FUNCTION CALLED! 🔥');
  
  // Create a fresh Prisma Client instance for each request
  const freshPrisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });
  
  try {
    console.log('API_MESSAGES: Creating fresh database connection...');
    await freshPrisma.$connect();
    
    console.log('API_MESSAGES: Executing raw count query...');
    const countResult = await freshPrisma.$queryRaw`SELECT COUNT(*) as count FROM InstagramMessage`;
    console.log('API_MESSAGES: Raw count result:', countResult);
    
    console.log('API_MESSAGES: Fetching messages from database...');
    const messages = await freshPrisma.instagramMessage.findMany({
      orderBy: {
        timestamp: 'desc'
      }
    });
    
    console.log(`API_MESSAGES: Found ${messages.length} messages.`);
    if (messages.length > 0) {
      console.log(`API_MESSAGES: Latest message text: ${messages[0].text}`);
    }
    
    return NextResponse.json(messages);
  } catch (error) {
    console.error('API_MESSAGES: Error fetching messages:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  } finally {
    await freshPrisma.$disconnect();
    console.log('API_MESSAGES: Database connection closed.');
  }
}
