import { NextRequest, NextResponse } from 'next/server';

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
    
    console.log('✅ REPLY_API: Message sent successfully');
    
    return NextResponse.json({
      success: true,
      messageId: result.message_id,
      recipientId: result.recipient_id
    });
    
  } catch (error) {
    console.error('REPLY_API: Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
