'use client'

import { useState } from 'react'
import { Send, Smile, Paperclip, MoreVertical, Clock, CheckCircle } from 'lucide-react'
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
  timestamp: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}
import { formatTime, getPlatformColor, getPlatformName } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface MessageDetailProps {
  conversationId: string | null;
  messages: InstagramMessage[];
  quickReplies: QuickReply[];
  onSendReply: (messageId: string, reply: string) => void;
}

export default function MessageDetail({ conversationId, messages, quickReplies, onSendReply }: MessageDetailProps) {
  const [replyText, setReplyText] = useState('')
  const [showQuickReplies, setShowQuickReplies] = useState(false)

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
                {messages[0].senderId.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{messages[0].senderId}</h2>
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
        <div className="space-y-4">
          {messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map(msg => (
            <div key={msg.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">{msg.senderId}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {formatTime(new Date(msg.timestamp))}
                </span>
              </div>
              <p className="text-gray-900 leading-relaxed">{msg.text}</p>
            </div>
          ))}
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

      {/* Reply Form */}
      <ReplyForm 
        recipientId={messages[0]?.senderId || ''}
        conversationId={conversationId}
        onReplySuccess={() => {
          // Refresh messages or show success notification
          console.log('Reply sent successfully!');
        }}
      />
    </div>
  )
}
