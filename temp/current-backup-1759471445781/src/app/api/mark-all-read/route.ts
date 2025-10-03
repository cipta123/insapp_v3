import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { platform } = body // 'instagram-dm', 'instagram-comments', 'whatsapp', or 'all'
    
    console.log('✅ MARK_READ: Marking messages as read for platform:', platform)
    
    let updated = {
      instagramDM: 0,
      instagramComments: 0,
      whatsapp: 0
    }
    
    if (platform === 'instagram-dm' || platform === 'all') {
      try {
        const result = await (prisma as any).message.updateMany({
          where: { isRead: false },
          data: { isRead: true }
        })
        updated.instagramDM = result.count
        console.log('📱 Instagram DM: Marked', result.count, 'messages as read')
      } catch (error) {
        console.log('⚠️ Instagram DM model not available')
      }
    }
    
    if (platform === 'instagram-comments' || platform === 'all') {
      try {
        const result = await prisma.instagramComment.updateMany({
          where: { 
            parentCommentId: null, // Only parent comments
            isReplied: false 
          },
          data: { isReplied: true }
        })
        updated.instagramComments = result.count
        console.log('💬 Instagram Comments: Marked', result.count, 'comments as replied')
      } catch (error) {
        console.log('⚠️ Instagram Comments model not available')
      }
    }
    
    if (platform === 'whatsapp' || platform === 'all') {
      try {
        const result = await (prisma as any).whatsAppMessage.updateMany({
          where: { 
            isRead: false,
            isFromBusiness: false // Only customer messages
          },
          data: { isRead: true }
        })
        updated.whatsapp = result.count
        console.log('📱 WhatsApp: Marked', result.count, 'messages as read')
      } catch (error) {
        console.log('⚠️ WhatsApp model not available')
      }
    }
    
    const totalUpdated = updated.instagramDM + updated.instagramComments + updated.whatsapp
    
    return NextResponse.json({
      success: true,
      message: `Marked ${totalUpdated} items as read`,
      updated
    })
    
  } catch (error) {
    console.error('❌ MARK_READ: Error:', error)
    return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 })
  }
}
