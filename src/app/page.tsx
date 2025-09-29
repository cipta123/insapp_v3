'use client'

import { useState, useMemo } from 'react'
import Sidebar from '@/components/Sidebar'
import StatsCards from '@/components/StatsCards'
import MessageList from '@/components/MessageList'
import MessageDetail from '@/components/MessageDetail'
import { mockMessages, quickReplies, stats } from '@/data/mockData'
import { Message, Platform, Reply } from '@/types'

export default function Home() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all')
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [messages, setMessages] = useState(mockMessages)

  // Calculate unread counts for each platform
  const unreadCounts = useMemo(() => {
    return {
      'instagram-comment': messages.filter(m => m.platform === 'instagram-comment' && m.status === 'unread').length,
      'instagram-dm': messages.filter(m => m.platform === 'instagram-dm' && m.status === 'unread').length,
      'whatsapp': messages.filter(m => m.platform === 'whatsapp' && m.status === 'unread').length,
    }
  }, [messages])

  // Handle platform change
  const handlePlatformChange = (platform: Platform | 'all') => {
    setSelectedPlatform(platform)
    setSelectedMessage(null) // Clear selected message when changing platform
  }

  // Handle message selection
  const handleMessageSelect = (message: Message) => {
    setSelectedMessage(message)
    
    // Mark message as read if it was unread
    if (message.status === 'unread') {
      setMessages(prev => 
        prev.map(m => 
          m.id === message.id 
            ? { ...m, status: 'read' as const }
            : m
        )
      )
    }
  }

  // Handle sending reply
  const handleSendReply = (messageId: string, reply: string) => {
    const newReply: Reply = {
      id: `reply_${Date.now()}`,
      content: reply,
      timestamp: new Date(),
      sender: 'agent'
    }

    // Update message with new reply and status
    setMessages(prev => 
      prev.map(m => 
        m.id === messageId 
          ? { 
              ...m, 
              status: 'replied' as const,
              replies: [...(m.replies || []), newReply]
            }
          : m
      )
    )

    // Update selected message to show the new reply immediately
    setSelectedMessage(prev => 
      prev?.id === messageId 
        ? {
            ...prev,
            status: 'replied' as const,
            replies: [...(prev.replies || []), newReply]
          }
        : prev
    )

    // In a real app, you would send the reply to the backend here
    console.log('Sending reply:', { messageId, reply, newReply })
    
    // Show success message (you could add a toast notification here)
    alert('Balasan berhasil dikirim!')
  }

  // Filter messages based on selected platform
  const filteredMessages = selectedPlatform === 'all' 
    ? messages 
    : messages.filter(m => m.platform === selectedPlatform)

  // Sort messages by timestamp (newest first)
  const sortedMessages = [...filteredMessages].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        selectedPlatform={selectedPlatform}
        onPlatformChange={handlePlatformChange}
        unreadCounts={unreadCounts}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Stats Cards */}
        <div className="p-6 bg-gray-50">
          <StatsCards stats={stats} />
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex">
          {/* Message List */}
          <MessageList
            messages={sortedMessages}
            selectedMessage={selectedMessage}
            onMessageSelect={handleMessageSelect}
            selectedPlatform={selectedPlatform}
          />

          {/* Message Detail */}
          <MessageDetail
            message={selectedMessage}
            quickReplies={quickReplies}
            onSendReply={handleSendReply}
          />
        </div>
      </div>
    </div>
  )
}
