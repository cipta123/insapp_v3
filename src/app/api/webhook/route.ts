import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const VERIFY_TOKEN = process.env.MESSENGER_VERIFY_TOKEN;
const APP_SECRET = process.env.APP_SECRET;

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
  if (!signature) {
    console.error('Missing x-hub-signature-256 header');
    return new NextResponse('Forbidden', { status: 403 });
  }

  if (!APP_SECRET) {
    console.error('APP_SECRET is not set in environment variables');
    return new NextResponse('Internal Server Error', { status: 500 });
  }

  const bodyText = await req.text();
  const expectedSignature = 'sha256=' + crypto.createHmac('sha256', APP_SECRET).update(bodyText).digest('hex');

  if (signature !== expectedSignature) {
    console.error('Invalid signature');
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = JSON.parse(bodyText);
    console.log('Received webhook event:', JSON.stringify(body, null, 2));

    if (body.object === 'instagram') {
      for (const entry of body.entry) {
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
              await prisma.instagramMessage.create({
                data: {
                  messageId: event.message.mid,
                  conversationId: standardizedConversationId, // Use standardized format
                  senderId: event.sender.id,
                  recipientId: event.recipient.id,
                  text: event.message.text,
                  timestamp: new Date(event.timestamp),
                },
              });
              console.log('✅ Message saved to database');
            }
          }
        }
      }
    }

    return new NextResponse('Event received', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook event:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
