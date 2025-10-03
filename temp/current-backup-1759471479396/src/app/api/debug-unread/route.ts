import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Checking unread messages across all platforms...')
    
    const debugData = {
      instagramDM: { total: 0, unread: [], unreadCount: 0 },
      instagramComments: { total: 0, unread: [], unreadCount: 0 },
      whatsapp: { total: 0, unread: [], unreadCount: 0 }
    }
    
    // Instagram DM Debug
    try {
      const instagramMessages = await (prisma as any).message.findMany()
      const unreadDM = instagramMessages.filter((m: any) => !m.isRead)
      
      debugData.instagramDM = {
        total: instagramMessages.length,
        unread: unreadDM.map((m: any) => ({
          id: m.id,
          messageId: m.messageId,
          text: m.text?.substring(0, 50) + '...',
          senderId: m.senderId,
          isRead: m.isRead,
          createdAt: m.createdAt
        })),
        unreadCount: unreadDM.length
      }
      
      console.log('📱 Instagram DM:', debugData.instagramDM.unreadCount, 'unread out of', debugData.instagramDM.total)
    } catch (error) {
      console.log('⚠️ Instagram DM model not available')
    }
    
    // Instagram Comments Debug
    try {
      const instagramComments = await prisma.instagramComment.findMany({
        where: { parentCommentId: null } // Only parent comments
      })
      const unreadComments = instagramComments.filter((c: any) => !c.isReplied)
      
      debugData.instagramComments = {
        total: instagramComments.length,
        unread: unreadComments.map((c: any) => ({
          id: c.id,
          commentId: c.commentId,
          text: c.text?.substring(0, 50) + '...',
          username: c.username,
          isReplied: c.isReplied,
          createdAt: c.createdAt
        })),
        unreadCount: unreadComments.length
      }
      
      console.log('💬 Instagram Comments:', debugData.instagramComments.unreadCount, 'unread out of', debugData.instagramComments.total)
    } catch (error) {
      console.log('⚠️ Instagram Comments model not available')
    }
    
    // WhatsApp Debug
    try {
      const whatsappMessages = await (prisma as any).whatsAppMessage.findMany()
      const unreadWhatsApp = whatsappMessages.filter((m: any) => !m.isRead && !m.isFromBusiness)
      
      debugData.whatsapp = {
        total: whatsappMessages.length,
        unread: unreadWhatsApp.map((m: any) => ({
          id: m.id,
          messageId: m.messageId,
          text: m.text?.substring(0, 50) + '...',
          conversationId: m.conversationId,
          isRead: m.isRead,
          isFromBusiness: m.isFromBusiness,
          timestamp: m.timestamp
        })),
        unreadCount: unreadWhatsApp.length
      }
      
      console.log('📱 WhatsApp:', debugData.whatsapp.unreadCount, 'unread out of', debugData.whatsapp.total)
    } catch (error) {
      console.log('⚠️ WhatsApp model not available')
    }
    
    const totalUnread = debugData.instagramDM.unreadCount + 
                       debugData.instagramComments.unreadCount + 
                       debugData.whatsapp.unreadCount
    
    console.log('🔍 TOTAL UNREAD:', totalUnread)
    
    return NextResponse.json({
      summary: {
        totalUnread,
        breakdown: {
          instagramDM: debugData.instagramDM.unreadCount,
          instagramComments: debugData.instagramComments.unreadCount,
          whatsapp: debugData.whatsapp.unreadCount
        }
      },
      details: debugData
    })
    
  } catch (error) {
    console.error('❌ DEBUG: Error:', error)
    return NextResponse.json({ error: 'Debug failed' }, { status: 500 })
  }
}
