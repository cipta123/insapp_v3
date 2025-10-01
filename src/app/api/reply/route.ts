import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    console.log('🔥 REPLY_API: Function called!');
    
    const body = await request.json();
    const { recipientId, message, conversationId } = body;
    
    console.log('REPLY_API: Request data:', { recipientId, message, conversationId });
    
    // Validasi input
    if (!recipientId || !message) {
      return NextResponse.json(
        { error: 'recipientId and message are required' },
        { status: 400 }
      );
    }
    
    // Instagram Graph API endpoint untuk mengirim pesan (using working PHP config)
    const BUSINESS_ACCOUNT_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
    const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
    const API_VERSION = process.env.INSTAGRAM_API_VERSION || 'v23.0';
    const BASE_URL = process.env.INSTAGRAM_BASE_URL || 'https://graph.instagram.com';
    
    console.log('REPLY_API: Environment check:', {
      hasAccessToken: !!ACCESS_TOKEN,
      hasBusinessAccountId: !!BUSINESS_ACCOUNT_ID,
      businessAccountId: BUSINESS_ACCOUNT_ID,
      accessTokenLength: ACCESS_TOKEN?.length || 0,
      apiVersion: API_VERSION,
      baseUrl: BASE_URL
    });
    
    if (!ACCESS_TOKEN) {
      console.error('REPLY_API: Instagram access token not found');
      return NextResponse.json(
        { error: 'Instagram access token not configured' },
        { status: 500 }
      );
    }
    
    if (!BUSINESS_ACCOUNT_ID) {
      console.error('REPLY_API: Instagram business account ID not found');
      return NextResponse.json(
        { error: 'Instagram business account ID not configured' },
        { status: 500 }
      );
    }
    
    // Use the same configuration as working PHP version
    const INSTAGRAM_API_URL = `${BASE_URL}/${API_VERSION}/${BUSINESS_ACCOUNT_ID}/messages`;
    console.log('REPLY_API: API URL:', INSTAGRAM_API_URL);
    
    // Payload untuk Instagram API
    const payload = {
      recipient: {
        id: recipientId
      },
      message: {
        text: message
      }
    };
    
    console.log('REPLY_API: Sending to Instagram API:', payload);
    
    // Kirim pesan ke Instagram
    const response = await fetch(INSTAGRAM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    console.log('REPLY_API: Instagram API response:', result);
    
    if (!response.ok) {
      console.error('REPLY_API: Instagram API error:', result);
      return NextResponse.json(
        { error: 'Failed to send message to Instagram', details: result },
        { status: response.status }
      );
    }
    
    console.log('✅ REPLY_API: Message sent to Instagram successfully');
    
    // Sekarang simpan reply ke database kita juga
    console.log('REPLY_API: Saving reply to local database...');
    
    const prisma = new PrismaClient();
    
    try {
      // Check if we already sent the same reply recently (prevent double-click)
      const businessId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || 'our_business';
      const ids = [recipientId, businessId].sort();
      const standardizedConversationId = `${ids[0]}_${ids[1]}`;
      
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      const recentDuplicate = await prisma.instagramMessage.findFirst({
        where: {
          conversationId: standardizedConversationId,
          senderId: businessId,
          text: message,
          timestamp: {
            gte: oneMinuteAgo
          }
        }
      });
      
      if (recentDuplicate) {
        console.log('⚠️ REPLY_API: Duplicate reply detected, skipping save:', {
          text: message,
          existingId: recentDuplicate.id,
          existingTimestamp: recentDuplicate.timestamp
        });
        
        return NextResponse.json({
          success: true,
          messageId: result.message_id,
          recipientId: result.recipient_id,
          savedToDatabase: false,
          reason: 'Duplicate reply prevented'
        });
      }
      
      // Generate unique messageId for our reply
      const uniqueMessageId = `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('REPLY_API: Generated unique messageId:', uniqueMessageId);
      console.log('REPLY_API: Instagram messageId:', result.message_id);
      console.log('REPLY_API: Original conversationId:', conversationId);
      console.log('REPLY_API: Standardized conversationId:', standardizedConversationId);
      
      const savedReply = await prisma.instagramMessage.create({
        data: {
          messageId: uniqueMessageId, // Always use our generated unique ID
          conversationId: standardizedConversationId, // Use standardized format
          senderId: businessId,
          recipientId: recipientId,
          text: message,
          timestamp: new Date(),
          isRead: true, // Our own replies are considered "read"
        }
      });
      
      console.log('✅ REPLY_API: Reply saved to database:', savedReply.id);
      
      return NextResponse.json({
        success: true,
        messageId: result.message_id,
        recipientId: result.recipient_id,
        savedToDatabase: true,
        localMessageId: savedReply.id
      });
      
    } catch (dbError) {
      console.error('REPLY_API: Database save error:', dbError);
      // Instagram message was sent successfully, but database save failed
      return NextResponse.json({
        success: true,
        messageId: result.message_id,
        recipientId: result.recipient_id,
        savedToDatabase: false,
        dbError: dbError instanceof Error ? dbError.message : 'Unknown database error'
      });
    } finally {
      await prisma.$disconnect();
    }
    
  } catch (error) {
    console.error('REPLY_API: Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
