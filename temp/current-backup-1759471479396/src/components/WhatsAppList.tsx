'use client'

import { useState, useEffect } from 'react'
import { Phone, RefreshCw, MessageCircle } from 'lucide-react'

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

interface WhatsAppContact {
  id: string;
  name?: string;
  lastMessage?: string;
  lastSeen: string;
  unreadCount: number;
  isBlocked: boolean;
}

interface WhatsAppListProps {
  selectedConversationId: string | null;
  onContactSelect: (contactId: string) => void;
}

export default function WhatsAppList({ selectedConversationId, onContactSelect }: WhatsAppListProps) {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([])
  const [contacts, setContacts] = useState<WhatsAppContact[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/whatsapp/messages')
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
        
        // Extract unique contacts from messages
        const contactMap = new Map<string, WhatsAppContact>()
        
        data.forEach((message: WhatsAppMessage) => {
          const contactId = message.conversationId
          
          if (!contactMap.has(contactId)) {
            contactMap.set(contactId, {
              id: contactId,
              name: message.senderId,
              lastMessage: message.text || '',
              lastSeen: message.timestamp,
              unreadCount: 0,
              isBlocked: false
            })
          }
          
          // Update last message if this message is newer
          const contact = contactMap.get(contactId)!
          if (new Date(message.timestamp) > new Date(contact.lastSeen)) {
            contact.lastMessage = message.text || ''
            contact.lastSeen = message.timestamp
          }
          
          // Count unread messages
          if (!message.isRead && !message.isFromBusiness) {
            contact.unreadCount++
          }
        })
        
        setContacts(Array.from(contactMap.values()).sort((a, b) => 
          new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime()
        ))
      }
    } catch (error) {
      console.error('Error fetching WhatsApp messages:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
    
    // Auto-refresh every 3 seconds
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [])

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

  if (loading) {
    return (
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading WhatsApp contacts...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Phone className="h-6 w-6 mr-3 text-green-600" />
            WhatsApp Chats
            <RefreshCw className="h-4 w-4 ml-2 text-green-500 animate-pulse" />
          </h2>
          <button
            onClick={fetchMessages}
            className="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto">
        {contacts.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No WhatsApp conversations yet</p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => onContactSelect(contact.id)}
                className={`p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                  selectedConversationId === contact.id ? 'bg-green-50 border-l-4 border-l-green-500' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {contact.name ? formatPhoneNumber(contact.name) : formatPhoneNumber(contact.id)}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {contact.unreadCount > 0 && (
                          <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {contact.unreadCount}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {formatTime(contact.lastSeen)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-1">
                      {contact.lastMessage || 'No messages yet'}
                    </p>
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
