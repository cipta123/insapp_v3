'use client'

import { useState } from 'react'
import { Send, Smile, Paperclip, MoreVertical, Clock, CheckCircle } from 'lucide-react'
import { Message, QuickReply, Reply } from '@/types'
import { formatTime, getPlatformColor, getPlatformName } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface MessageDetailProps {
  message: Message | null
  quickReplies: QuickReply[]
  onSendReply: (messageId: string, reply: string) => void
}

export default function MessageDetail({ message, quickReplies, onSendReply }: MessageDetailProps) {
  const [replyText, setReplyText] = useState('')
  const [showQuickReplies, setShowQuickReplies] = useState(false)

  if (!message) {
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
    if (replyText.trim()) {
      onSendReply(message.id, replyText)
      setReplyText('')
      setShowQuickReplies(false)
    }
  }

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
            {/* Avatar */}
            {message.sender.avatar ? (
              <img
                src={message.sender.avatar}
                alt={message.sender.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-lg font-medium text-gray-600">
                  {message.sender.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold text-gray-900">{message.sender.name}</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">{message.sender.username}</span>
                <span className={cn(
                  "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                  getPlatformColor(message.platform),
                  "text-white"
                )}>
                  {getPlatformName(message.platform)}
                </span>
              </div>
            </div>
          </div>

          <button className="p-2 text-gray-400 hover:text-gray-600">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Message Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Message */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                {getStatusIcon(message.status)}
                <span className="text-sm font-medium text-gray-700">
                  {getStatusText(message.status)}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {formatTime(message.timestamp)}
              </span>
            </div>

            <p className="text-gray-900 leading-relaxed">{message.content}</p>

            {/* Post Image for Instagram Comments */}
            {message.platform === 'instagram-comment' && message.postImage && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Komentar pada post:</p>
                <img
                  src={message.postImage}
                  alt="Post"
                  className="w-32 h-32 rounded-lg object-cover"
                />
              </div>
            )}
          </div>

          {/* Conversation History */}
          {message.replies && message.replies.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
                Riwayat Percakapan
              </h4>
              {message.replies.map((reply) => (
                <div
                  key={reply.id}
                  className={cn(
                    "rounded-lg p-4",
                    reply.sender === 'agent' 
                      ? "bg-blue-50 ml-4" 
                      : "bg-gray-50 mr-4"
                  )}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center",
                      reply.sender === 'agent' 
                        ? "bg-blue-500" 
                        : "bg-gray-400"
                    )}>
                      <span className="text-xs text-white font-medium">
                        {reply.sender === 'agent' ? 'CS' : message.sender.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className={cn(
                      "text-sm font-medium",
                      reply.sender === 'agent' 
                        ? "text-blue-700" 
                        : "text-gray-700"
                    )}>
                      {reply.sender === 'agent' ? 'Customer Service' : message.sender.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTime(reply.timestamp)}
                    </span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {reply.content}
                  </p>
                </div>
              ))}
            </div>
          )}
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

      {/* Reply Input */}
      <div className="border-t border-gray-200 p-6">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Tulis balasan..."
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => setShowQuickReplies(!showQuickReplies)}
              className={cn(
                "p-3 rounded-lg transition-colors",
                showQuickReplies 
                  ? "bg-blue-100 text-blue-600" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              <Smile className="h-5 w-5" />
            </button>
            <button className="p-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
              <Paperclip className="h-5 w-5" />
            </button>
            <button
              onClick={handleSendReply}
              disabled={!replyText.trim()}
              className={cn(
                "p-3 rounded-lg transition-colors",
                replyText.trim()
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              )}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
