import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import axios from 'axios'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📸 WATZAP_IMAGE: Starting image send process...', body)
    
    const { conversationId, imageUrl, caption, separateCaption } = body
    
    if (!conversationId || !imageUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: conversationId, imageUrl' },
        { status: 400 }
      )
    }
    
    // Send image via Watzap.id API
    console.log('📤 WATZAP_IMAGE: Sending image via Watzap.id API...')
    console.log('📤 WATZAP_IMAGE: To:', conversationId)
    console.log('📤 WATZAP_IMAGE: Image URL:', imageUrl)
    console.log('📤 WATZAP_IMAGE: Caption:', caption)
    
    const watzapData = {
      api_key: process.env.WATZAP_API_KEY,
      number_key: process.env.WATZAP_NUMBER_KEY,
      phone_no: conversationId,
      url: imageUrl,
      message: caption || '',
      separate_caption: separateCaption ? '1' : '0'
    }
    
    console.log('🔑 WATZAP_IMAGE: Using API Key:', process.env.WATZAP_API_KEY)
    console.log('🔑 WATZAP_IMAGE: Using Number Key:', process.env.WATZAP_NUMBER_KEY)
    
    const watzapResponse = await axios({
      method: 'post',
      url: 'https://api.watzap.id/v1/send_image_url',
      headers: { 
        'Content-Type': 'application/json'
      },
      data: watzapData
    })
    
    console.log('✅ WATZAP_IMAGE: Watzap.id API response:', watzapResponse.data)
    
    // Create a unique message ID for our image
    const imageMessageId = `watzap_image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Save the image message to our database (with temporary fix)
    let imageMessage;
    try {
      imageMessage = await (prisma as any).whatsAppMessage.create({
        data: {
          messageId: imageMessageId,
          conversationId: conversationId,
          senderId: 'business',
          recipientId: conversationId,
          text: caption || null,
          messageType: 'image',
          mediaUrl: imageUrl,
          timestamp: new Date(),
          isFromBusiness: true,
          replyToId: null
        }
      })
      
      console.log('✅ WATZAP_IMAGE: Image message saved to database:', imageMessage.id)
      
    } catch (modelError) {
      console.log('⚠️ WATZAP_IMAGE: WhatsApp model not available yet, skipping database save')
      imageMessage = { id: 'temp_' + Date.now() }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Image sent successfully via Watzap.id',
      imageMessageId: imageMessage.id,
      watzapResponse: watzapResponse.data
    })
    
  } catch (error: any) {
    console.error('❌ WATZAP_IMAGE: Error sending image:', error)
    
    // Log more details about the error
    if (error.response) {
      console.error('❌ WATZAP_IMAGE: API Error Response:', error.response.data)
      console.error('❌ WATZAP_IMAGE: API Error Status:', error.response.status)
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to send image via Watzap.id',
        details: error.response?.data || error.message
      },
      { status: 500 }
    )
  }
}
