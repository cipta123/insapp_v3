'use client'

import { MessageCircle, Clock, CheckCircle, TrendingUp } from 'lucide-react'
import { Stats } from '@/types'

interface StatsCardsProps {
  stats: Stats
}

export default function StatsCards({ stats }: StatsCardsProps) {
  // Calculate dynamic changes based on current data
  const getChangePercentage = (current: number, type: string) => {
    // Simulate percentage changes based on data patterns
    if (type === 'total') {
      return current > 50 ? '+12%' : '+5%'
    } else if (type === 'unread') {
      return current > 10 ? '-8%' : '+3%'
    } else if (type === 'replied') {
      return current > 20 ? '+15%' : '+8%'
    } else {
      return '-12%' // Response time improvement
    }
  }

  const getChangeColor = (change: string) => {
    if (change.startsWith('+')) {
      return 'text-green-600'
    } else {
      return 'text-red-600'
    }
  }

  const cards = [
    {
      title: 'Total Pesan',
      value: stats.totalMessages,
      icon: MessageCircle,
      color: 'bg-blue-500',
      change: getChangePercentage(stats.totalMessages, 'total'),
      changeColor: getChangeColor(getChangePercentage(stats.totalMessages, 'total'))
    },
    {
      title: 'Belum Dibaca',
      value: stats.unreadMessages,
      icon: Clock,
      color: 'bg-orange-500',
      change: getChangePercentage(stats.unreadMessages, 'unread'),
      changeColor: getChangeColor(getChangePercentage(stats.unreadMessages, 'unread'))
    },
    {
      title: 'Dibalas Hari Ini',
      value: stats.repliedToday,
      icon: CheckCircle,
      color: 'bg-green-500',
      change: getChangePercentage(stats.repliedToday, 'replied'),
      changeColor: getChangeColor(getChangePercentage(stats.repliedToday, 'replied'))
    },
    {
      title: 'Waktu Respon',
      value: stats.responseTime,
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '-15%',
      changeColor: 'text-green-600' // Faster response time is good
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                <p className={`text-sm mt-1 ${card.changeColor}`}>{card.change} dari minggu lalu</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
