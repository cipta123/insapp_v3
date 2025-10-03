import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { conversationId } = await request.json();
    
    if (!conversationId) {
      return new NextResponse('Missing conversationId', { status: 400 });
    }

    console.log('📖 MARK_READ: Marking messages as read for conversation:', conversationId);

    // Mark all messages in this conversation as read
    // Only mark customer messages as read (not our own business messages)
    const result = await prisma.instagramMessage.updateMany({
      where: {
        conversationId: conversationId,
        senderId: {
          not: '17841404217906448' // Don't mark our own messages as "read"
        },
        isRead: false // Only update unread messages
      },
      data: {
        isRead: true
      }
    });

    console.log(`📖 MARK_READ: Marked ${result.count} messages as read`);

    return NextResponse.json({ 
      success: true, 
      updatedCount: result.count 
    });

  } catch (error) {
    console.error('📖 MARK_READ: Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
