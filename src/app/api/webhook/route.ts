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
            await prisma.instagramMessage.create({
              data: {
                messageId: event.message.mid,
                conversationId: event.sender.id + '_' + event.recipient.id, // Simple conversation ID
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

    return new NextResponse('Event received', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook event:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
