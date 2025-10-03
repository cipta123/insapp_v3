import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('📝 API_POSTS: Fetching posts with comments...');
    
    // Get all posts with comment counts
    const posts = await prisma.instagramPost.findMany({
      include: {
        comments: {
          where: {
            parentCommentId: null // Only top-level comments for count
          },
          orderBy: {
            timestamp: 'desc'
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`📝 API_POSTS: Found ${posts.length} posts`);
    
    // Format response with comment counts
    const postsWithCounts = posts.map(post => ({
      ...post,
      commentCount: post._count.comments,
      unreadComments: post.comments.filter(c => !c.isReplied).length,
      latestComment: post.comments[0] || null
    }));
    
    return NextResponse.json(postsWithCounts);
    
  } catch (error) {
    console.error('📝 API_POSTS: Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
