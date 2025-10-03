'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Smile, Paperclip, MoreVertical, Clock, CheckCircle, Reply } from 'lucide-react'
import { QuickReply } from '@/types'
import ReplyForm from './ReplyForm'

// This should match the type in page.tsx
interface InstagramMessage {
  id: string;
  messageId: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  text: string;
  timestamp: string; // Comes as string from JSON
  isRead: boolean;
  isFromBusiness?: boolean; // New field to detect business messages
  createdAt: string;
  updatedAt: string;
  // Reply functionality
  replyToId?: string | null;
  replyTo?: InstagramMessage | null;
}
import { formatTime, getPlatformColor, getPlatformName } from '@/lib/utils'
import { cn } from '@/lib/utils'

// Get user display name with cache integration
const getUserDisplayName = (userId: string, userCache: {[key: string]: any}) => {
  // Hardcoded business account - updated to match .env
  if (userId === '17841404895525433') {
    return 'Customer Service Bot';
  }
  
  // Check cache for real Instagram names
  if (userCache[userId]) {
    return userCache[userId].displayName;
  }
  
  // Fallback while loading
  return `User ${userId.slice(-4)}`;
};

interface MessageDetailProps {
  conversationId: string | null;
  messages: InstagramMessage[];
  quickReplies: QuickReply[];
  onSendReply: (messageId: string, reply: string) => void;
  onRefreshMessages?: () => void; // Add refresh function
}

export default function MessageDetail({ conversationId, messages, quickReplies, onSendReply, onRefreshMessages }: MessageDetailProps) {
  const [replyText, setReplyText] = useState('')
  const [showQuickReplies, setShowQuickReplies] = useState(false)
  const [replyingTo, setReplyingTo] = useState<InstagramMessage | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [userCache, setUserCache] = useState<{[key: string]: any}>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom only on initial load, not on every message change
  useEffect(() => {
    if (messages.length > 0 && conversationId) {
      // Only auto-scroll on initial conversation load
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [conversationId]) // Only trigger when conversation changes, not on every message update

  // Set client-side rendering flag
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Fetch user cache on component mount
  useEffect(() => {
    fetchUserCache()
  }, [])

  const fetchUserCache = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const userData = await response.json()
        setUserCache(userData)
      }
    } catch (error) {
      console.error('Failed to fetch user cache:', error)
    }
  }

  if (!conversationId || messages.length === 0) {
    return (
      <div className="w-1/2 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Pilih Pesan</h3>
          <p className="text-gray-500">Pilih pesan dari daftar untuk mulai membalas</p>
        </div>
      </div>
    )
  }

  const handleSendReply = () => {
    if (replyText.trim() && conversationId) {
      // We need the recipient's ID to reply. We can get it from the last message.
      const lastMessage = messages[messages.length - 1];
      onSendReply(lastMessage.senderId, replyText); // The sender of the last message is our recipient
      setReplyText('');
      setShowQuickReplies(false);
    }
  };

  const handleQuickReply = (reply: QuickReply) => {
    setReplyText(reply.content)
    setShowQuickReplies(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unread': return <Clock className="h-4 w-4 text-orange-500" />
      case 'read': return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'replied': return <CheckCircle className="h-4 w-4 text-green-500" />
      default: return null
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
    <div className="w-1/2 bg-white relative">
      {/* Header - Instagram Style */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-lg font-medium text-white">
                {getUserDisplayName(messages[0].senderId, userCache).charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="font-semibold">{getUserDisplayName(messages[0].senderId, userCache)}</h2>
              <div className="text-sm text-purple-100">
                Instagram Direct Message
              </div>
            </div>
          </div>
          <button className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Conversation History - Scrollable */}
      <div className="absolute inset-0 top-[80px] bottom-[80px] overflow-y-auto p-4 bg-gray-50 chat-container" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e3f2fd' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}>
        <div className="space-y-4">
          {messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map(msg => {
            // Use the new isFromBusiness field if available, fallback to senderId check
            const businessId = '17841404895525433'; // Updated to match .env
            const isFromBusiness = msg.isFromBusiness !== undefined 
              ? msg.isFromBusiness 
              : msg.senderId === businessId;
            
            return (
              <div key={msg.id} className={`flex ${isFromBusiness ? 'justify-end' : 'justify-start'} group`}>
                <div className={`relative max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow-sm ${
                  isFromBusiness 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-800 shadow-md'
                }`}>
                  {/* Reply context - if this message is a reply */}
                  {msg.replyTo && (
                    <div className={`mb-2 p-2 rounded border-l-2 ${
                      isFromBusiness 
                        ? 'bg-blue-600 border-blue-300 text-blue-100' 
                        : 'bg-gray-100 border-gray-400 text-gray-600'
                    }`}>
                      <div className="text-xs opacity-75 mb-1">
                        Replying to {getUserDisplayName(msg.replyTo.senderId, userCache)}
                      </div>
                      <div className="text-xs line-clamp-2">
                        {msg.replyTo.text}
                      </div>
                    </div>
                  )}
                  
                  {/* Message Content - Text Only */}
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <div className={`text-xs mt-2 flex items-center justify-end space-x-1 ${
                    isFromBusiness ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    <span>{isClient ? formatTime(new Date(msg.timestamp)) : new Date(msg.timestamp).toLocaleString()}</span>
                    {isFromBusiness && (
                      <CheckCircle className="h-3 w-3" />
                    )}
                  </div>
                </div>
                
                {/* Reply button - only show on hover and for customer messages */}
                {!isFromBusiness && (
                  <button
                    onClick={() => setReplyingTo(msg)}
                    className="ml-2 p-1 rounded-full bg-white hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    title="Reply to this message"
                  >
                    <Reply className="h-4 w-4 text-gray-600" />
                  </button>
                )}
              </div>
            );
          })}
          {/* Auto-scroll target */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Replies */}
      {showQuickReplies && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Replies:</h4>
          <div className="grid grid-cols-1 gap-2">
            {quickReplies.map((reply) => (
              <button
                key={reply.id}
                onClick={() => handleQuickReply(reply)}
                className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-sm text-gray-900">{reply.title}</div>
                <div className="text-xs text-gray-600 mt-1 line-clamp-2">{reply.content}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reply Context Display */}
      {replyingTo && (
        <div className="border-t border-gray-200 bg-blue-50 p-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-xs text-blue-600 font-medium mb-1">
                Replying to {getUserDisplayName(replyingTo.senderId, userCache)}:
              </div>
              <div className="text-sm text-gray-700 line-clamp-2">
                {replyingTo.text}
              </div>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="ml-2 p-1 rounded-full hover:bg-blue-100 text-blue-600"
              title="Cancel reply"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Reply Form */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t">
        <ReplyForm 
        recipientId={(() => {
          // Find the customer ID (not our business ID)
          const businessId = '17841404217906448'; // Our business account ID
          // Look through messages to find the customer ID
          for (const msg of messages) {
            if (msg.senderId !== businessId) {
              return msg.senderId; // This is the customer
            }
            if (msg.recipientId !== businessId) {
              return msg.recipientId; // This is the customer
            }
          }
          
          // Fallback: extract from conversationId
          if (conversationId) {
            const ids = conversationId.split('_');
            return ids.find((id: string) => id !== businessId) || ids[0];
          }
          return '';
        })()}
        conversationId={conversationId}
        replyToMessage={replyingTo}
        onReplySuccess={() => {
          // Smart refresh: only refresh messages data
          console.log('Reply sent successfully! Refreshing messages...');
          setReplyingTo(null); // Clear reply context
          if (onRefreshMessages) {
            setTimeout(() => {
              onRefreshMessages();
            }, 1000); // Shorter delay for better UX
          }
        }}
      />
      </div>

    </div>
  )
}
