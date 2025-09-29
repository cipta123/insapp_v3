'use client'

import { MessageCircle, Clock, CheckCircle, TrendingUp } from 'lucide-react'
import { Stats } from '@/types'

interface StatsCardsProps {
  stats: Stats
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Pesan',
      value: stats.totalMessages,
      icon: MessageCircle,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Belum Dibaca',
      value: stats.unreadMessages,
      icon: Clock,
      color: 'bg-orange-500',
      change: '-5%'
    },
    {
      title: 'Dibalas Hari Ini',
      value: stats.repliedToday,
      icon: CheckCircle,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Waktu Respon',
      value: stats.responseTime,
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '-15%'
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
                <p className="text-sm text-green-600 mt-1">{card.change} dari minggu lalu</p>
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
