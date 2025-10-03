import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    console.log('📊 STATS_API: Calculating dashboard statistics...')
    
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    
    // Calculate stats with fallback for missing models
    let totalMessages = 0
    let unreadMessages = 0
    let repliedToday = 0
    let avgResponseTime = '0 menit'
    
    try {
      // Instagram DM Stats (with fallback)
      let instagramMessages: any[] = []
      let unreadInstagramDM = 0
      
      try {
        instagramMessages = await (prisma as any).message.findMany()
        unreadInstagramDM = instagramMessages.filter((m: any) => !m.isRead).length
      } catch (dmError) {
        console.log('⚠️ STATS_API: Instagram DM model not available, using 0')
      }
      
      // Instagram Comments Stats
      let instagramComments: any[] = []
      let unreadInstagramComments = 0
      
      try {
        instagramComments = await prisma.instagramComment.findMany({
          where: { parentCommentId: null } // Only parent comments
        })
        unreadInstagramComments = instagramComments.filter((c: any) => !c.isReplied).length
      } catch (commentError) {
        console.log('⚠️ STATS_API: Instagram Comment model not available, using 0')
      }
      
      // WhatsApp Stats (with fallback)
      let whatsappMessages: any[] = []
      let unreadWhatsApp = 0
      
      try {
        whatsappMessages = await (prisma as any).whatsAppMessage.findMany()
        unreadWhatsApp = whatsappMessages.filter((m: any) => !m.isRead && !m.isFromBusiness).length
      } catch (whatsappError) {
        console.log('⚠️ STATS_API: WhatsApp model not available, using 0')
      }
      
      // Calculate totals
      totalMessages = instagramMessages.length + instagramComments.length + whatsappMessages.length
      unreadMessages = unreadInstagramDM + unreadInstagramComments + unreadWhatsApp
      
      // Calculate replies today (Instagram Comments + DM replies + WhatsApp business messages)
      let instagramRepliestoday = 0
      try {
        instagramRepliestoday = await prisma.instagramComment.count({
          where: {
            parentCommentId: { not: null }, // Replies only
            createdAt: {
              gte: startOfDay,
              lt: endOfDay
            }
          }
        })
      } catch (replyError) {
        console.log('⚠️ STATS_API: Cannot count Instagram replies, using 0')
      }
      
      const instagramDMRepliestoday = instagramMessages.filter((m: any) => {
        const messageDate = new Date(m.createdAt)
        return messageDate >= startOfDay && messageDate < endOfDay && m.senderId === process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID
      }).length
      
      const whatsappRepliestoday = whatsappMessages.filter((m: any) => {
        const messageDate = new Date(m.timestamp)
        return messageDate >= startOfDay && messageDate < endOfDay && m.isFromBusiness
      }).length
      
      repliedToday = instagramRepliestoday + instagramDMRepliestoday + whatsappRepliestoday
      
      // Calculate average response time (simplified)
      const recentReplies = await prisma.instagramComment.findMany({
        where: {
          parentCommentId: { not: null },
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        },
        include: {
          parentComment: true
        },
        take: 10
      })
      
      if (recentReplies.length > 0) {
        const responseTimes = recentReplies.map(reply => {
          if (reply.parentComment) {
            const responseTime = new Date(reply.createdAt).getTime() - new Date(reply.parentComment.createdAt).getTime()
            return responseTime / (1000 * 60) // Convert to minutes
          }
          return 0
        }).filter(time => time > 0)
        
        if (responseTimes.length > 0) {
          const avgMinutes = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
          if (avgMinutes < 60) {
            avgResponseTime = `${Math.round(avgMinutes)} menit`
          } else {
            avgResponseTime = `${Math.round(avgMinutes / 60)} jam`
          }
        }
      }
      
    } catch (error) {
      console.error('❌ STATS_API: Error calculating stats:', error)
      // Use fallback values
      totalMessages = 0
      unreadMessages = 0
      repliedToday = 0
      avgResponseTime = '0 menit'
    }
    
    const stats = {
      totalMessages,
      unreadMessages,
      repliedToday,
      responseTime: avgResponseTime
    }
    
    console.log('✅ STATS_API: Statistics calculated:', stats)
    
    return NextResponse.json(stats)
    
  } catch (error) {
    console.error('❌ STATS_API: Error fetching stats:', error)
    
    // Return fallback stats
    return NextResponse.json({
      totalMessages: 0,
      unreadMessages: 0,
      repliedToday: 0,
      responseTime: '0 menit'
    })
  }
}
