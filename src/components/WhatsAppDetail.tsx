'use client'

import { useState, useEffect, useRef } from 'react'
import { Phone, Send, User, CheckCheck } from 'lucide-react'

interface WhatsAppMessage {
  id: string;
  messageId: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  text?: string | null;
  messageType: string;
  mediaUrl?: string | null;
  timestamp: string;
  isRead: boolean;
  isFromBusiness: boolean;
  createdAt: string;
  updatedAt: string;
}

interface WhatsAppDetailProps {
  conversationId: string | null;
  onRefreshContacts?: () => void;
  onRefreshUnreadCount?: () => void;
}

export default function WhatsAppDetail({ conversationId, onRefreshContacts, onRefreshUnreadCount }: WhatsAppDetailProps) {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([])
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/whatsapp/messages')
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Error fetching WhatsApp messages:', error)
    }
  }

  useEffect(() => {
    fetchMessages()
    
    // Auto-refresh every 3 seconds
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [])

  // Auto-scroll to bottom when messages change or conversation is selected
  // Auto-scroll only when conversation changes, not on every message update
  useEffect(() => {
    if (conversationId) {
      fetchMessages()
      // Mark messages as read when conversation is opened
      markAsRead(conversationId)
      // Auto-scroll on conversation change
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 200)
    }
  }, [conversationId]) // Only trigger when conversation changes

  const markAsRead = async (conversationId: string) => {
    try {
      console.log('📖 Marking WhatsApp conversation as read:', conversationId)
      const response = await fetch('/api/whatsapp/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conversationId })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ WhatsApp messages marked as read:', result)
        // Refresh contact list to update unread badges
        if (onRefreshContacts) {
          onRefreshContacts()
        }
        // Refresh sidebar unread count
        if (onRefreshUnreadCount) {
          onRefreshUnreadCount()
        }
      } else {
        console.error('❌ Failed to mark WhatsApp messages as read')
      }
    } catch (error) {
      console.error('❌ Error marking WhatsApp messages as read:', error)
    }
  }

  const handleSendReply = async () => {
    if (!conversationId || !replyText.trim() || sending) return

    setSending(true)
    
    try {
      const response = await fetch('/api/whatsapp/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: conversationId,
          replyText: replyText.trim()
        })
      })

      if (response.ok) {
        setReplyText('')
        
        // Wait a bit before refreshing to avoid race condition
        setTimeout(() => {
          fetchMessages()
          // Auto-scroll after sending message
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
          }, 200)
        }, 500)
      } else {
        console.error('Failed to send WhatsApp reply')
      }
    } catch (error) {
      console.error('Error sending WhatsApp reply:', error)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatPhoneNumber = (phoneNumber: string) => {
    return phoneNumber.replace('@s.whatsapp.net', '').replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3')
  }

  const getConversationMessages = (conversationId: string) => {
    return messages
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }

  if (!conversationId) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center h-screen">
        <div className="text-center">
          <Phone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Contact</h3>
          <p className="text-gray-500">Choose a WhatsApp conversation from the left to start chatting</p>
        </div>
      </div>
    )
  }

  const conversationMessages = getConversationMessages(conversationId)
  const contactName = conversationMessages.length > 0 
    ? formatPhoneNumber(conversationMessages[0].senderId === conversationMessages[0].conversationId 
        ? conversationMessages[0].recipientId 
        : conversationMessages[0].senderId)
    : formatPhoneNumber(conversationId)

  return (
    <div className="w-1/2 bg-white flex flex-col max-w-[50%] overflow-hidden">
      {/* Header - WhatsApp Style */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">{contactName}</h3>
              <p className="text-sm text-green-100">WhatsApp Contact</p>
            </div>
          </div>
          <Phone className="h-5 w-5" />
        </div>
      </div>

      {/* Messages Area - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 bg-green-50 chat-container" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23dcf8c6' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}>
        {conversationMessages.length === 0 ? (
          <div className="text-center py-8">
            <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No messages in this conversation yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {conversationMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isFromBusiness ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`relative max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow-sm ${
                  message.isFromBusiness 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white text-gray-800 shadow-md'
                }`}>
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <div className={`text-xs mt-2 flex items-center justify-end space-x-1 ${
                    message.isFromBusiness ? 'text-green-100' : 'text-gray-500'
                  }`}>
                    <span>{formatTime(message.timestamp)}</span>
                    {message.isFromBusiness && (
                      <CheckCheck className="h-3 w-3" />
                    )}
                  </div>
                </div>
              </div>
            ))}
            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Reply Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type a message..."
              className="w-full p-3 border border-gray-300 rounded-2xl resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendReply()
                }
              }}
            />
          </div>
          <button
            onClick={handleSendReply}
            disabled={!replyText.trim() || sending}
            className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
