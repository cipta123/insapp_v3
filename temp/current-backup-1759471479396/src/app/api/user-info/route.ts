import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return new NextResponse('Missing userId parameter', { status: 400 });
    }

    console.log('USER_INFO: Fetching info for user:', userId);

    // Check if we already have this user in cache
    const existingUser = await prisma.instagramUser.findUnique({
      where: { id: userId }
    });

    // If user exists and was fetched recently (within 24 hours), return cached data
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (existingUser && existingUser.lastFetched > oneDayAgo) {
      console.log('USER_INFO: Returning cached user data');
      return NextResponse.json(existingUser);
    }

    // Fetch from Instagram Graph API
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('USER_INFO: Instagram access token not configured');
      return new NextResponse('Instagram access token not configured', { status: 500 });
    }

    console.log('USER_INFO: Fetching from Instagram Graph API...');
    const instagramResponse = await fetch(
      `https://graph.instagram.com/v18.0/${userId}?fields=name,username&access_token=${accessToken}`
    );

    if (!instagramResponse.ok) {
      console.error('USER_INFO: Instagram API error:', instagramResponse.status);
      
      // If API fails, return existing user data or fallback
      if (existingUser) {
        return NextResponse.json(existingUser);
      }
      
      return NextResponse.json({
        id: userId,
        name: `User ${userId.slice(-4)}`,
        username: null
      });
    }

    const userData = await instagramResponse.json();
    console.log('USER_INFO: Instagram API response:', userData);

    // Save/update user data in database
    const savedUser = await prisma.instagramUser.upsert({
      where: { id: userId },
      update: {
        name: userData.name || null,
        username: userData.username || null,
        lastFetched: new Date()
      },
      create: {
        id: userId,
        name: userData.name || null,
        username: userData.username || null,
        lastFetched: new Date()
      }
    });

    console.log('USER_INFO: User data saved/updated');
    return NextResponse.json(savedUser);

  } catch (error) {
    console.error('USER_INFO: Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
