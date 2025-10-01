'use client'

import { useState } from 'react'
import { MessageCircle, Instagram, MessageSquare, BarChart3, Settings, Bell, ExternalLink, User, ChevronDown, ChevronRight, Cog } from 'lucide-react'
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
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false)
  
  const menuItems = [
    {
      id: 'all' as const,
      label: 'Semua Pesan',
      icon: MessageCircle,
      count: Object.values(unreadCounts).reduce((a, b) => a + b, 0)
    },
    {
      id: 'instagram-comment' as Platform,
      label: 'Instagram Comment',
      icon: Instagram,
      count: unreadCounts['instagram-comment']
    },
    {
      id: 'instagram-dm' as Platform,
      label: 'Instagram DM',
      icon: MessageSquare,
      count: unreadCounts['instagram-dm']
    },
    {
      id: 'whatsapp' as Platform,
      label: 'WhatsApp',
      icon: MessageCircle,
      count: unreadCounts['whatsapp']
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
            const isActive = selectedPlatform === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => onPlatformChange(item.id)}
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
              </button>
            )
          })}
        </div>

        {/* Secondary Navigation */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="space-y-2">
            <Link 
              href="/analytics"
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors",
                pathname === '/analytics'
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <BarChart3 className="h-5 w-5" />
              <span>Analytics</span>
              {pathname === '/analytics' && <ExternalLink className="h-4 w-4 ml-auto" />}
            </Link>
            
            <Link 
              href="/debug-unread"
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors",
                pathname === '/debug-unread'
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <Bell className="h-5 w-5" />
              <span>Debug Unread</span>
              {pathname === '/debug-unread' && <ExternalLink className="h-4 w-4 ml-auto" />}
            </Link>
            
            <div className="relative">
              <button 
                onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
                {showSettingsDropdown ? 
                  <ChevronDown className="h-4 w-4 ml-auto" /> : 
                  <ChevronRight className="h-4 w-4 ml-auto" />
                }
              </button>
              
              {/* Settings Dropdown */}
              {showSettingsDropdown && (
                <div className="ml-4 mt-2 space-y-1">
                  <Link 
                    href="/profile"
                    className={cn(
                      "flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      pathname === '/profile'
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                    {pathname === '/profile' && <ExternalLink className="h-3 w-3 ml-auto" />}
                  </Link>
                  
                  <Link 
                    href="/config"
                    className={cn(
                      "flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      pathname === '/config'
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Cog className="h-4 w-4" />
                    <span>Config</span>
                    {pathname === '/config' && <ExternalLink className="h-3 w-3 ml-auto" />}
                  </Link>
                </div>
              )}
            </div>
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
