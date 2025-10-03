'use client'

import { useState, useEffect, useRef } from 'react'
import { Phone, RefreshCw, MessageCircle, MoreVertical, UserX, Trash2, CheckCheck, Archive } from 'lucide-react'

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
  refreshTrigger?: number; // Add trigger for external refresh
}

export default function WhatsAppList({ selectedConversationId, onContactSelect, refreshTrigger }: WhatsAppListProps) {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([])
  const [contacts, setContacts] = useState<WhatsAppContact[]>([])
  const [loading, setLoading] = useState(true)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

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

  // Refresh when external trigger changes (for mark as read)
  useEffect(() => {
    if (refreshTrigger !== undefined) {
      console.log('🔄 Refreshing WhatsApp contacts due to external trigger')
      fetchMessages()
    }
  }, [refreshTrigger])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
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

  const handleMenuAction = async (action: string, contactId: string) => {
    console.log(`🔧 WhatsApp action: ${action} for contact: ${contactId}`)
    
    switch (action) {
      case 'mark-read':
        try {
          const response = await fetch('/api/whatsapp/mark-read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversationId: contactId })
          })
          if (response.ok) {
            console.log('✅ Messages marked as read')
            fetchMessages() // Refresh to update unread count
          }
        } catch (error) {
          console.error('❌ Failed to mark as read:', error)
        }
        break
        
      case 'block':
        // TODO: Implement block functionality
        console.log('🚫 Block contact:', contactId)
        break
        
      case 'delete':
        // TODO: Implement delete conversation functionality
        console.log('🗑️ Delete conversation:', contactId)
        break
        
      case 'archive':
        // TODO: Implement archive functionality
        console.log('📦 Archive conversation:', contactId)
        break
    }
    
    setOpenMenuId(null) // Close menu after action
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
    <div className="w-1/2 bg-white border-r border-gray-200 relative">
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
          </button>
        </div>
      </div>

      {/* Contacts List */}
      <div className="absolute inset-0 top-[120px] overflow-y-auto sidebar-scroll">
        {contacts.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No WhatsApp conversations yet</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 py-2">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className={`relative p-4 hover:bg-gray-50 transition-colors ${
                  selectedConversationId === contact.id ? 'bg-green-50 border-l-4 border-l-green-500' : ''
                }`}
              >
                <div 
                  className="flex items-center space-x-3 cursor-pointer"
                  onClick={() => {
                    console.log('🔍 WhatsApp contact clicked:', contact.id)
                    onContactSelect(contact.id)
                  }}
                >
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0 pr-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                        {contact.name ? formatPhoneNumber(contact.name) : formatPhoneNumber(contact.id)}
                      </h3>
                      <div className="flex items-center space-x-1 mr-2">
                        {contact.unreadCount > 0 && (
                          <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {contact.unreadCount}
                          </span>
                        )}
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatTime(contact.lastSeen)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-1">
                      {contact.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                </div>
                
                {/* Three Dots Menu */}
                <div className="absolute top-3 right-2" ref={openMenuId === contact.id ? menuRef : null}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setOpenMenuId(openMenuId === contact.id ? null : contact.id)
                    }}
                    className="p-1.5 rounded-full hover:bg-gray-200 transition-colors opacity-70 hover:opacity-100"
                  >
                    <MoreVertical className="h-4 w-4 text-gray-600" />
                  </button>
                  
                  {/* Popup Menu */}
                  {openMenuId === contact.id && (
                    <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[160px]">
                      <button
                        onClick={() => handleMenuAction('mark-read', contact.id)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <CheckCheck className="h-4 w-4" />
                        <span>Mark as Read</span>
                      </button>
                      <button
                        onClick={() => handleMenuAction('archive', contact.id)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <Archive className="h-4 w-4" />
                        <span>Archive</span>
                      </button>
                      <button
                        onClick={() => handleMenuAction('block', contact.id)}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <UserX className="h-4 w-4" />
                        <span>Block Contact</span>
                      </button>
                      <button
                        onClick={() => handleMenuAction('delete', contact.id)}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete Chat</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
