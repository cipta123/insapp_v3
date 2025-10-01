import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('🔥 API_COMMENTS: FUNCTION CALLED! 🔥');
    console.log('API_COMMENTS: Creating fresh database connection...');
    
    // Get all comments with post and user info
    const comments = await prisma.instagramComment.findMany({
      include: {
        post: true,
        parentComment: true,
        replies: {
          include: {
            post: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });
    
    console.log(`API_COMMENTS: Found ${comments.length} comments.`);
    
    if (comments.length > 0) {
      console.log('API_COMMENTS: Latest comment text:', comments[0].text.substring(0, 50) + '...');
    }
    
    console.log('API_COMMENTS: Database connection closed.');
    
    return NextResponse.json(comments);
    
  } catch (error) {
    console.error('API_COMMENTS: Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
