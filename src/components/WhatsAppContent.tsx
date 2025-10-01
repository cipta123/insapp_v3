'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send, Phone, User, Clock, Check, CheckCheck, Image, FileText, Mic, Video } from 'lucide-react'

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
  replyToId?: string | null;
}

interface WhatsAppContact {
  id: string;
  name?: string | null;
  profileName?: string | null;
  lastSeen: string;
  isBlocked: boolean;
}

export default function WhatsAppContent() {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([])
  const [contacts, setContacts] = useState<WhatsAppContact[]>([])
  const [selectedContact, setSelectedContact] = useState<WhatsAppContact | null>(null)
  const [replyText, setReplyText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/whatsapp/messages')
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
        
        // Extract unique contacts from messages
        const contactMap = new Map<string, WhatsAppContact>()
        data.forEach((msg: WhatsAppMessage) => {
          if (!msg.isFromBusiness && !contactMap.has(msg.senderId)) {
            contactMap.set(msg.senderId, {
              id: msg.senderId,
              name: msg.senderId, // Use phone number as name for now
              profileName: null,
              lastSeen: msg.timestamp,
              isBlocked: false
            })
          }
        })
        
        const contactsList = Array.from(contactMap.values())
        setContacts(contactsList)
        
        // Auto-select first contact if none selected
        if (!selectedContact && contactsList.length > 0) {
          const firstContact = contactsList[0]
          setSelectedContact(firstContact)
          // Mark messages as read for auto-selected contact
          markContactMessagesAsRead(firstContact.id)
        }
        
        setLoading(false)
      }
    } catch (error) {
      console.error('Failed to fetch WhatsApp messages:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
    
    // Auto-refresh every 3 seconds
    const interval = setInterval(() => {
      fetchMessages()
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const markContactMessagesAsRead = async (contactId: string) => {
    try {
      console.log('📖 WHATSAPP_UI: Marking messages as read for contact:', contactId)
      
      const response = await fetch('/api/whatsapp/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: contactId
        })
      })

      if (response.ok) {
        console.log('✅ WHATSAPP_UI: Messages marked as read')
        // Refresh messages to update UI
        setTimeout(() => {
          fetchMessages()
        }, 500)
      } else {
        console.error('Failed to mark WhatsApp messages as read')
      }
    } catch (error) {
      console.error('Error marking WhatsApp messages as read:', error)
    }
  }

  const handleContactSelect = (contact: WhatsAppContact) => {
    setSelectedContact(contact)
    // Mark all messages from this contact as read
    markContactMessagesAsRead(contact.id)
  }

  const handleSendReply = async () => {
    if (!selectedContact || !replyText.trim() || sending) return

    setSending(true)
    console.log('🚀 WHATSAPP_UI: Sending reply...', { 
      contact: selectedContact.id, 
      text: replyText.trim(),
      sending 
    })

    try {
      const response = await fetch('/api/whatsapp/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: selectedContact.id,
          replyText: replyText.trim()
        })
      })

      if (response.ok) {
        console.log('✅ WhatsApp reply sent successfully')
        setReplyText('')
        
        // Wait a bit before refreshing to avoid race condition
        setTimeout(() => {
          fetchMessages()
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
    const now = new Date()
    const minutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (minutes < 1) return 'Baru saja'
    if (minutes < 60) return `${minutes}m`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h`
    return `${Math.floor(minutes / 1440)}d`
  }

  const formatPhoneNumber = (phone: string) => {
    // Format phone number for display
    if (phone.startsWith('+')) return phone
    return `+${phone}`
  }

  const getContactMessages = (contactId: string) => {
    return messages
      .filter(msg => msg.conversationId === contactId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }

  const getMessageIcon = (messageType: string) => {
    switch (messageType) {
      case 'image': return <Image className="h-4 w-4" />
      case 'audio': return <Mic className="h-4 w-4" />
      case 'video': return <Video className="h-4 w-4" />
      case 'document': return <FileText className="h-4 w-4" />
      default: return null
    }
  }

  if (loading) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading WhatsApp messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-gray-50 flex">
      {/* Contacts List - WhatsApp Style */}
      <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Phone className="h-5 w-5 mr-2 text-green-600" />
            WhatsApp Chats
          </h2>
          
          {contacts.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No WhatsApp conversations yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {contacts.map((contact) => {
                const contactMessages = getContactMessages(contact.id)
                const lastMessage = contactMessages[contactMessages.length - 1]
                const unreadCount = contactMessages.filter(msg => !msg.isRead && !msg.isFromBusiness).length
                
                return (
                  <div
                    key={contact.id}
                    onClick={() => handleContactSelect(contact)}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 relative ${
                      selectedContact?.id === contact.id
                        ? 'bg-green-50 border border-green-200'
                        : unreadCount > 0
                        ? 'bg-green-50 hover:bg-green-100 border-l-4 border-green-500'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {/* Contact Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          {unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm truncate ${
                            unreadCount > 0 
                              ? 'font-bold text-gray-900' 
                              : 'font-semibold text-gray-700'
                          }`}>
                            {contact.name || formatPhoneNumber(contact.id)}
                          </p>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {formatTime(contact.lastSeen)}
                            </span>
                          </div>
                        </div>
                      </div>
                      {unreadCount > 0 && (
                        <div className="min-w-[20px] h-5 px-2 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">{unreadCount > 99 ? '99+' : unreadCount}</span>
                        </div>
                      )}
                    </div>

                    {/* Last Message Preview */}
                    {lastMessage && (
                      <div className="flex items-center space-x-2">
                        {lastMessage.isFromBusiness && (
                          <CheckCheck className="h-3 w-3 text-blue-500" />
                        )}
                        {getMessageIcon(lastMessage.messageType)}
                        <p className={`text-xs truncate flex-1 ${
                          unreadCount > 0 && !lastMessage.isFromBusiness
                            ? 'font-semibold text-gray-900'
                            : 'text-gray-600'
                        }`}>
                          {lastMessage.messageType === 'text' 
                            ? lastMessage.text 
                            : `${lastMessage.messageType.charAt(0).toUpperCase() + lastMessage.messageType.slice(1)}`
                          }
                        </p>
                        <span className="text-xs text-gray-400">
                          {formatTime(lastMessage.timestamp)}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area - WhatsApp Style */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="bg-green-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {selectedContact.name || formatPhoneNumber(selectedContact.id)}
                    </h3>
                    <p className="text-sm text-green-100">
                      Last seen {formatTime(selectedContact.lastSeen)}
                    </p>
                  </div>
                </div>
                <Phone className="h-5 w-5" />
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-green-50" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23dcf8c6' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}>
              {getContactMessages(selectedContact.id).length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No messages in this conversation yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getContactMessages(selectedContact.id).map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isFromBusiness ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.isFromBusiness 
                          ? 'bg-green-500 text-white' 
                          : 'bg-white text-gray-800 shadow-sm'
                      }`}>
                        {message.messageType !== 'text' && (
                          <div className="flex items-center space-x-2 mb-2">
                            {getMessageIcon(message.messageType)}
                            <span className="text-xs opacity-75">
                              {message.messageType.charAt(0).toUpperCase() + message.messageType.slice(1)}
                            </span>
                          </div>
                        )}
                        
                        {message.text && (
                          <div className="text-sm">{message.text}</div>
                        )}
                        
                        <div className={`text-xs mt-1 flex items-center justify-end space-x-1 ${
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
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-green-50">
            <div className="text-center">
              <Phone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Contact</h3>
              <p className="text-gray-500">Choose a WhatsApp conversation from the left to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
