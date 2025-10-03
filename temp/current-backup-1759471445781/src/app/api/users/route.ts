import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('USERS_API: Fetching all users...');
    
    const users = await prisma.instagramUser.findMany({
      orderBy: {
        lastFetched: 'desc'
      }
    });
    
    console.log(`USERS_API: Found ${users.length} users`);
    
    // Convert to key-value mapping for easy lookup
    const userMap: { [key: string]: any } = {};
    users.forEach(user => {
      userMap[user.id] = {
        id: user.id,
        name: user.name,
        username: user.username,
        displayName: user.name || user.username || `User ${user.id.slice(-4)}`
      };
    });
    
    return NextResponse.json(userMap);
    
  } catch (error) {
    console.error('USERS_API: Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
