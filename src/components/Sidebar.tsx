'use client'

import { useState } from 'react'
import { MessageCircle, Instagram, MessageSquare, BarChart3, Settings, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Platform } from '@/types'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  selectedPlatform: Platform | 'all'
  onPlatformChange: (platform: Platform | 'all') => void
  unreadCounts: Record<Platform, number>
}

export default function Sidebar({ selectedPlatform, onPlatformChange, unreadCounts }: SidebarProps) {
  const pathname = usePathname()
  
  const menuItems = [
    {
      id: 'all' as const,
      label: 'Semua Pesan',
      icon: MessageCircle,
      count: Object.values(unreadCounts).reduce((a, b) => a + b, 0),
      href: '/'
    },
    {
      id: 'instagram-comment' as Platform,
      label: 'Instagram Comment',
      icon: Instagram,
      count: unreadCounts['instagram-comment'],
      href: '/comments'
    },
    {
      id: 'instagram-dm' as Platform,
      label: 'Instagram DM',
      icon: MessageSquare,
      count: unreadCounts['instagram-dm'],
      href: '/'
    },
    {
      id: 'whatsapp' as Platform,
      label: 'WhatsApp',
      icon: MessageCircle,
      count: unreadCounts['whatsapp'],
      href: '/'
    }
  ]

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Customer Service</h1>
        <p className="text-sm text-gray-500 mt-1">Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = (item.href === '/' && pathname === '/') || 
                           (item.href !== '/' && pathname === item.href) ||
                           (pathname === '/' && selectedPlatform === item.id)
            
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => {
                  if (item.href === '/') {
                    onPlatformChange(item.id)
                  }
                }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors",
                  isActive 
                    ? "bg-blue-50 text-blue-700 border border-blue-200" 
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.count > 0 && (
                  <span className={cn(
                    "px-2 py-1 text-xs font-medium rounded-full",
                    isActive 
                      ? "bg-blue-100 text-blue-700" 
                      : "bg-red-100 text-red-700"
                  )}>
                    {item.count}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Secondary Navigation */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="space-y-2">
            <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
              <BarChart3 className="h-5 w-5" />
              <span className="font-medium">Analytics</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
              <Bell className="h-5 w-5" />
              <span className="font-medium">Notifications</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
              <Settings className="h-5 w-5" />
              <span className="font-medium">Settings</span>
            </button>
          </div>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium">CS</span>
          </div>
          <div>
            <p className="font-medium text-gray-900">Customer Service</p>
            <p className="text-sm text-gray-500">Online</p>
          </div>
        </div>
      </div>
    </div>
  )
}
