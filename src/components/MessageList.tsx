'use client'

import { useState } from 'react'
import { Search, Filter, MoreVertical } from 'lucide-react'
import { Message, Platform } from '@/types'
import { formatTime, getPlatformColor, getPlatformName } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface MessageListProps {
  messages: Message[]
  selectedMessage: Message | null
  onMessageSelect: (message: Message) => void
  selectedPlatform: Platform | 'all'
}

export default function MessageList({ messages, selectedMessage, onMessageSelect, selectedPlatform }: MessageListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read' | 'replied'>('all')

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.sender.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || message.status === statusFilter
    const matchesPlatform = selectedPlatform === 'all' || message.platform === selectedPlatform
    
    return matchesSearch && matchesStatus && matchesPlatform
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread': return 'bg-red-100 text-red-700'
      case 'read': return 'bg-yellow-100 text-yellow-700'
      case 'replied': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'unread': return 'Belum dibaca'
      case 'read': return 'Sudah dibaca'
      case 'replied': return 'Sudah dibalas'
      default: return status
    }
  }

  return (
    <div className="w-1/2 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {selectedPlatform === 'all' ? 'Semua Pesan' : getPlatformName(selectedPlatform)}
          </h2>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Cari pesan atau nama..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-sm border border-gray-300 rounded px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Status</option>
            <option value="unread">Belum Dibaca</option>
            <option value="read">Sudah Dibaca</option>
            <option value="replied">Sudah Dibalas</option>
          </select>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto">
        {filteredMessages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Tidak ada pesan yang ditemukan</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                onClick={() => onMessageSelect(message)}
                className={cn(
                  "p-4 cursor-pointer transition-colors hover:bg-gray-50",
                  selectedMessage?.id === message.id && "bg-blue-50 border-r-2 border-blue-500"
                )}
              >
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {message.sender.avatar ? (
                      <img
                        src={message.sender.avatar}
                        alt={message.sender.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {message.sender.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {message.sender.name}
                        </h3>
                        <span className={cn(
                          "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                          getPlatformColor(message.platform),
                          "text-white"
                        )}>
                          {getPlatformName(message.platform)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>

                    {/* Content */}
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {message.content}
                    </p>

                    {/* Post Image for Instagram Comments */}
                    {message.platform === 'instagram-comment' && message.postImage && (
                      <div className="mb-2">
                        <img
                          src={message.postImage}
                          alt="Post"
                          className="w-16 h-16 rounded object-cover"
                        />
                      </div>
                    )}

                    {/* Status */}
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                        getStatusColor(message.status)
                      )}>
                        {getStatusText(message.status)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {message.sender.username}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
