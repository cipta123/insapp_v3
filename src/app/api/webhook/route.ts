import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const VERIFY_TOKEN = process.env.MESSENGER_VERIFY_TOKEN;
const APP_SECRET = process.env.APP_SECRET;

// Function to ensure user info is cached
async function ensureUserInfo(userId: string) {
  try {
    // Skip if it's our business account
    const businessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || '17841404895525433';
    if (userId === businessAccountId) {
      return;
    }

    // Check if user already exists and was fetched recently (within 24 hours)
    const existingUser = await prisma.instagramUser.findUnique({
      where: { id: userId }
    });

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (existingUser && existingUser.lastFetched > oneDayAgo) {
      console.log('👤 User info already cached:', userId);
      return;
    }

    console.log('🔍 Fetching user info for:', userId);

    // Fetch from Instagram Graph API
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('❌ Instagram access token not configured');
      return;
    }

    const instagramResponse = await fetch(
      `https://graph.instagram.com/v18.0/${userId}?fields=name,username&access_token=${accessToken}`
    );

    if (instagramResponse.ok) {
      const userData = await instagramResponse.json();
      console.log('✅ User data fetched:', userData);

      // Save/update user data
      await prisma.instagramUser.upsert({
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

      console.log('💾 User info saved to database');
    } else {
      console.error('❌ Failed to fetch user info:', instagramResponse.status);
    }

  } catch (error) {
    console.error('💥 Error in ensureUserInfo:', error);
  }
}

// Function to handle comment events
async function handleCommentEvent(commentData: any) {
  try {
    console.log('💬 COMMENT: Processing comment event...');
    
    // Extract comment information
    const commentId = commentData.id;
    const postId = commentData.media?.id || commentData.parent_id;
    const userId = commentData.from?.id;
    const username = commentData.from?.username;
    const text = commentData.text;
    // Use current time if created_time is not available
    const timestamp = commentData.created_time 
      ? new Date(commentData.created_time * 1000) 
      : new Date();
    const parentCommentId = commentData.parent_id !== postId ? commentData.parent_id : null;
    
    console.log('💬 COMMENT: Details:', {
      commentId,
      postId,
      userId,
      username,
      text: text?.substring(0, 50) + '...',
      isReply: !!parentCommentId
    });
    
    // Check if comment already exists
    const existingComment = await prisma.instagramComment.findUnique({
      where: { commentId }
    });
    
    if (existingComment) {
      console.log('⚠️ COMMENT: Comment already exists, skipping:', commentId);
      return;
    }
    
    // Ensure post exists
    if (postId) {
      await prisma.instagramPost.upsert({
        where: { postId },
        update: {},
        create: {
          postId,
          mediaType: commentData.media?.media_type || 'UNKNOWN',
          permalink: commentData.media?.permalink
        }
      });
    }
    
    // Save comment
    await prisma.instagramComment.create({
      data: {
        commentId,
        postId,
        parentCommentId,
        userId,
        username,
        text: text || '',
        timestamp
      }
    });
    
    console.log('✅ COMMENT: Comment saved to database');
    
    // Auto-fetch user info if not exists
    if (userId) {
      await ensureUserInfo(userId);
    }
    
  } catch (error) {
    console.error('💥 COMMENT: Error processing comment:', error);
  }
}

/**
 * Handles Watzap.id webhook message events
 */
async function handleWatzapMessage(webhookData: any) {
  try {
    console.log('📱 WATZAP: Processing webhook data:', webhookData);
    
    // Watzap.id webhook format: { type: "incoming_chat", data: {...} }
    if (webhookData.type !== 'incoming_chat') {
      console.log('📱 WATZAP: Not an incoming chat, skipping');
      return;
    }
    
    const messageData = webhookData.data;
    if (!messageData) {
      console.log('📱 WATZAP: No message data in webhook');
      return;
    }
    
    const messageId = messageData.message_id;
    const chatId = messageData.chat_id; // Phone number
    const senderName = messageData.name;
    const messageBody = messageData.message_body;
    const timestamp = new Date(messageData.timestamp * 1000);
    const hasMedia = messageData.has_media;
    const mediaMime = messageData.media_mime;
    const mediaName = messageData.media_name;
    const isFromMe = messageData.is_from_me;
    
    console.log('📱 WATZAP: Message details:', {
      messageId,
      chatId,
      senderName,
      messageBody,
      hasMedia,
      isFromMe,
      timestamp
    });
    
    // Skip messages from business (sent by us)
    if (isFromMe) {
      console.log('📱 WATZAP: Message is from business, skipping');
      return;
    }
    
    // Check if message already exists (with temporary fix)
    try {
      const existingMessage = await (prisma as any).whatsAppMessage.findUnique({
        where: { messageId }
      });
      
      if (existingMessage) {
        console.log('⚠️ WATZAP: Message already exists, skipping:', messageId);
        return;
      }
    } catch (modelError) {
      console.log('⚠️ WATZAP: WhatsApp model not available for duplicate check, continuing...');
    }
    
    // Determine message type based on media
    let messageType = 'text';
    let mediaUrl = null;
    
    if (hasMedia) {
      if (mediaMime?.startsWith('image/')) {
        messageType = 'image';
      } else if (mediaMime?.startsWith('audio/')) {
        messageType = 'audio';
      } else if (mediaMime?.startsWith('video/')) {
        messageType = 'video';
      } else {
        messageType = 'document';
      }
      mediaUrl = mediaName; // Store media name/reference
    }
    
    // Save message to database (with temporary fix)
    try {
      await (prisma as any).whatsAppMessage.create({
        data: {
          messageId,
          conversationId: chatId, // Use chat_id as conversation ID
          senderId: chatId,
          recipientId: 'business',
          text: messageBody || null,
          messageType,
          mediaUrl,
          timestamp,
          isFromBusiness: false // Incoming messages are from customers
        }
      });
      
      console.log('✅ WATZAP: Message saved to database');
      
      // Auto-save contact info if not exists
      await (prisma as any).whatsAppContact.upsert({
        where: { id: chatId },
        update: { 
          lastSeen: new Date(),
          name: senderName || null
        },
        create: {
          id: chatId,
          name: senderName || null,
          profileName: senderName || null,
          lastSeen: new Date()
        }
      });
      
      console.log('✅ WATZAP: Contact info updated');
      
    } catch (modelError) {
      console.log('⚠️ WATZAP: WhatsApp models not available yet, skipping database save');
    }
    
  } catch (error) {
    console.error('💥 WATZAP: Error processing message:', error);
  }
}

/**
 * Handles webhook verification for the Instagram Graph API.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified successfully!');
    return new NextResponse(challenge, { status: 200 });
  } else {
    console.error('❌ Failed to verify webhook. Make sure the verify token matches.');
    return new NextResponse('Forbidden', { status: 403 });
  }
}

/**
 * Handles incoming webhook events from Instagram.
 */
export async function POST(req: NextRequest) {
  const signature = req.headers.get('x-hub-signature-256');
  
  // Skip signature validation in development for testing
  const isDevelopment = process.env.NODE_ENV === 'development';
  let bodyText: string;
  
  if (!isDevelopment) {
    if (!signature) {
      console.error('Missing x-hub-signature-256 header');
      return new NextResponse('Forbidden', { status: 403 });
    }

    if (!APP_SECRET) {
      console.error('APP_SECRET is not set in environment variables');
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    bodyText = await req.text();
    const expectedSignature = 'sha256=' + crypto.createHmac('sha256', APP_SECRET).update(bodyText).digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid signature');
      return new NextResponse('Unauthorized', { status: 401 });
    }
  } else {
    console.log('🧪 DEVELOPMENT: Skipping signature validation for testing');
    bodyText = await req.text();
  }

  try {
    const body = JSON.parse(bodyText);
    console.log('Received webhook event:', JSON.stringify(body, null, 2));

    if (body.object === 'instagram') {
      for (const entry of body.entry) {
        // Handle messaging events (DMs)
        if (entry.messaging) {
          for (const event of entry.messaging) {
          if (event.message) {
            // Standardize conversationId format: always put smaller ID first
            const ids = [event.sender.id, event.recipient.id].sort();
            const standardizedConversationId = `${ids[0]}_${ids[1]}`;
            
            console.log('WEBHOOK: Original IDs:', event.sender.id, event.recipient.id);
            console.log('WEBHOOK: Standardized conversationId:', standardizedConversationId);
            
            // Check if message already exists to prevent duplicates
            // Check by messageId first
            const existingByMessageId = await prisma.instagramMessage.findUnique({
              where: {
                messageId: event.message.mid
              }
            });
            
            // Also check for duplicate content in same conversation within last 5 minutes
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            const existingByContent = await prisma.instagramMessage.findFirst({
              where: {
                conversationId: standardizedConversationId,
                senderId: event.sender.id,
                text: event.message.text,
                timestamp: {
                  gte: fiveMinutesAgo
                }
              }
            });
            
            if (existingByMessageId) {
              console.log('⚠️ WEBHOOK: Message already exists (by messageId), skipping:', event.message.mid);
            } else if (existingByContent) {
              console.log('⚠️ WEBHOOK: Duplicate content detected, skipping:', {
                text: event.message.text,
                senderId: event.sender.id,
                existingId: existingByContent.id
              });
            } else {
              // Determine if message is from business
              const businessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || '17841404895525433';
              const isFromBusiness = event.sender.id === businessAccountId;
              
              await prisma.instagramMessage.create({
                data: {
                  messageId: event.message.mid,
                  conversationId: standardizedConversationId, // Use standardized format
                  senderId: event.sender.id,
                  recipientId: event.recipient.id,
                  text: event.message.text,
                  timestamp: new Date(event.timestamp),
                  isFromBusiness: isFromBusiness, // Set based on sender ID
                },
              });
              console.log('✅ Message saved to database', { isFromBusiness, senderId: event.sender.id });

              // Auto-fetch user info if not exists
              await ensureUserInfo(event.sender.id);
            }
          }
        }
        }
        
        // Handle comments events
        if (entry.changes) {
          for (const change of entry.changes) {
            if (change.field === 'comments') {
              console.log('WEBHOOK: Received comment event:', JSON.stringify(change.value, null, 2));
              await handleCommentEvent(change.value);
            }
          }
        }
      }
    }

    // Handle Watzap.id webhook events
    if (body.type === 'incoming_chat') {
      console.log('📱 WATZAP_WEBHOOK: Processing Watzap.id event...');
      console.log('📱 WATZAP_WEBHOOK: Received message event:', JSON.stringify(body, null, 2));
      await handleWatzapMessage(body);
    }

    return new NextResponse('Event received', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook event:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
