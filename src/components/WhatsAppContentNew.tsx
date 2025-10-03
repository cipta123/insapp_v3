'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, MoreVertical, User, Phone, Send, MessageCircle } from 'lucide-react'

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

export default function WhatsAppContentNew() {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([])
  const [contacts, setContacts] = useState<WhatsAppContact[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [replyText, setReplyText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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

  // Auto-scroll to bottom when messages change or conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [messages, selectedConversationId])

  const handleSendReply = async () => {
    if (!selectedConversationId || !replyText.trim() || sending) return

    setSending(true)
    
    try {
      const response = await fetch('/api/whatsapp/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: selectedConversationId,
          replyText: replyText.trim()
        })
      })

      if (response.ok) {
        setReplyText('')
        
        setTimeout(() => {
          fetchMessages()
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
          }, 200)
        }, 500)
      }
    } catch (error) {
      console.error('Error sending WhatsApp reply:', error)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  const formatPhoneNumber = (phoneNumber: string) => {
    return phoneNumber.replace('@s.whatsapp.net', '').replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3')
  }

  const getConversationMessages = (conversationId: string) => {
    return messages
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }

  const selectedMessages = selectedConversationId 
    ? getConversationMessages(selectedConversationId)
    : []

  const selectedContact = contacts.find(c => c.id === selectedConversationId)

  return (
    <>
      {/* Message List - EXACT Instagram DM Style */}
      <div className="w-1/2 bg-white border-r border-gray-200 flex flex-col h-screen">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              WhatsApp Chats
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No WhatsApp conversations yet</p>
            </div>
          ) : (
          <div className="divide-y divide-gray-100">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setSelectedConversationId(contact.id)}
                className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedConversationId === contact.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <Phone className="h-5 w-5 text-white" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {formatPhoneNumber(contact.name || contact.id)}
                        </h3>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          WhatsApp
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {formatTime(contact.lastSeen)}
                        </span>
                        {contact.unreadCount > 0 && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                    </div>

                    {/* Message Preview */}
                    <p className="text-sm text-gray-600 truncate">
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

      {/* Message Detail - EXACT Instagram DM Style */}
      <div className="w-1/2 bg-white flex flex-col h-screen">
        {selectedContact ? (
          <>
            {/* Header */}
            <div className="bg-green-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{formatPhoneNumber(selectedContact.name || selectedContact.id)}</h3>
                    <p className="text-sm text-green-100">WhatsApp Contact</p>
                  </div>
                </div>
                <button className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Conversation History */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e3f2fd' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}>
              <div className="space-y-4">
                {selectedMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isFromBusiness ? 'justify-end' : 'justify-start'} group`}>
                    <div className={`relative max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow-sm ${
                      msg.isFromBusiness 
                        ? 'bg-green-500 text-white' 
                        : 'bg-white text-gray-800 shadow-md'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <div className={`text-xs mt-2 flex items-center justify-end space-x-1 ${
                        msg.isFromBusiness ? 'text-green-100' : 'text-gray-500'
                      }`}>
                        <span>{formatTime(msg.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
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
                  />
                </div>
                <button
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
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
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Message</h3>
              <p className="text-gray-500">Choose a conversation from the left to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
