import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { commentId, replyText } = await request.json();
    
    if (!commentId || !replyText) {
      return new NextResponse('Missing commentId or replyText', { status: 400 });
    }

    console.log('💬 COMMENT_REPLY: Replying to comment:', commentId);
    console.log('💬 COMMENT_REPLY: Reply text:', replyText.substring(0, 50) + '...');

    // Get the original comment to find post info
    const originalComment = await prisma.instagramComment.findUnique({
      where: { commentId }
    });

    if (!originalComment) {
      return new NextResponse('Comment not found', { status: 404 });
    }

    // Reply via Instagram Graph API
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('❌ Instagram access token not configured');
      return new NextResponse('Instagram access token not configured', { status: 500 });
    }

    console.log('📡 COMMENT_REPLY: Sending reply via Instagram API...');
    
    const instagramResponse = await fetch(
      `https://graph.instagram.com/v18.0/${commentId}/replies`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: replyText,
          access_token: accessToken
        })
      }
    );

    console.log('📡 COMMENT_REPLY: Instagram API Response Status:', instagramResponse.status);
    
    if (instagramResponse.ok) {
      const result = await instagramResponse.json();
      console.log('✅ COMMENT_REPLY: Reply sent successfully:', result);
      console.log('✅ COMMENT_REPLY: New reply ID:', result.id);

      // Mark original comment as replied
      await prisma.instagramComment.update({
        where: { commentId },
        data: { isReplied: true }
      });

      console.log('📝 COMMENT_REPLY: Comment marked as replied');

      return NextResponse.json({ 
        success: true, 
        replyId: result.id 
      });
    } else {
      const error = await instagramResponse.text();
      console.error('❌ COMMENT_REPLY: Failed to send reply:', error);
      return new NextResponse(`Failed to send reply: ${error}`, { status: 500 });
    }

  } catch (error) {
    console.error('💥 COMMENT_REPLY: Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
