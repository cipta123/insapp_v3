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
  // Hardcoded business account
  if (userId === '17841404217906448') {
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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
    <div className="w-1/2 bg-white flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-lg font-medium text-gray-600">
                {getUserDisplayName(messages[0].senderId, userCache).charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{getUserDisplayName(messages[0].senderId, userCache)}</h2>
              <div className="text-xs text-gray-500">ID: {messages[0].senderId}</div>
              <div className="flex items-center space-x-2">
                <span className={cn(
                  "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                  getPlatformColor('instagram-dm'),
                  "text-white"
                )}>
                  {getPlatformName('instagram-dm')}
                </span>
              </div>
            </div>
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Conversation History */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-3">
          {messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map(msg => {
            const businessId = '17841404217906448';
            const isFromBusiness = msg.senderId === businessId;
            
            return (
              <div key={msg.id} className={`flex ${isFromBusiness ? 'justify-end' : 'justify-start'} group`}>
                <div className={`relative max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isFromBusiness 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : 'bg-gray-200 text-gray-900 rounded-bl-none'
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
                  <div className={`text-xs mt-1 ${
                    isFromBusiness ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {isClient ? formatTime(new Date(msg.timestamp)) : new Date(msg.timestamp).toLocaleString()}
                  </div>
                </div>
                
                {/* Reply button - only show on hover and for customer messages */}
                {!isFromBusiness && (
                  <button
                    onClick={() => setReplyingTo(msg)}
                    className="ml-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
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
  )
}
