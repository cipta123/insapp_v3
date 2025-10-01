'use client'

import { useState, useMemo, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import StatsCards from '@/components/StatsCards'
import MessageList from '@/components/MessageList'
import MessageDetail from '@/components/MessageDetail'
import { quickReplies, stats } from '@/data/mockData'
import { Platform, Reply } from '@/types'
import CommentsContent from '@/components/CommentsContent'
import WhatsAppContent from '@/components/WhatsAppContent'

// Define a type that matches our Prisma model
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
}

export default function Home() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all')
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<InstagramMessage[]>([])
  const [comments, setComments] = useState<any[]>([])
  const [whatsappMessages, setWhatsappMessages] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalMessages: 0,
    unreadMessages: 0,
    repliedToday: 0,
    responseTime: '0 menit'
  })
  const [isTabActive, setIsTabActive] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [isClient, setIsClient] = useState(false)

  const fetchMessages = async () => {
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/messages`;
      const response = await fetch(apiUrl, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      setMessages(data);
      setLastRefresh(new Date());
      console.log('📱 Messages refreshed:', data.length, 'messages');
    } catch (error) {
      console.error('❌ Failed to refresh messages:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/comments`;
      const response = await fetch(apiUrl, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      const data = await response.json();
      setComments(data);
      console.log('💬 Comments refreshed:', data.length, 'comments');
    } catch (error) {
      console.error('❌ Failed to refresh comments:', error);
    }
  };

  const fetchWhatsAppMessages = async () => {
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/whatsapp/messages`;
      const response = await fetch(apiUrl, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Failed to fetch WhatsApp messages');
      }
      const data = await response.json();
      setWhatsappMessages(data);
      console.log('📱 WhatsApp messages refreshed:', data.length, 'messages');
    } catch (error) {
      console.error('❌ Failed to refresh WhatsApp messages:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/stats`;
      const response = await fetch(apiUrl, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const data = await response.json();
      setStats(data);
      console.log('📊 Stats refreshed:', data);
    } catch (error) {
      console.error('❌ Failed to refresh stats:', error);
    }
  };

  useEffect(() => {
    setIsClient(true);
    fetchMessages();
    fetchComments();
    fetchWhatsAppMessages();
    fetchStats();
    
    // Track tab visibility for smart polling
    const handleVisibilityChange = () => {
      setIsTabActive(!document.hidden);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Set up auto-refresh every 3 seconds for new messages, comments, WhatsApp, and stats (only when tab is active)
    const interval = setInterval(() => {
      if (isTabActive) {
        fetchMessages();
        fetchComments();
        fetchWhatsAppMessages();
        fetchStats();
      }
    }, 3000); // 3 seconds
    
    // Cleanup on component unmount
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isTabActive]);

  // Calculate unread counts for each platform
  const unreadCounts = useMemo(() => {
    // Count unread comments (comments that haven't been replied to)
    const unreadComments = comments.filter(c => !c.parentCommentId && !c.isReplied).length
    
    // Count unread WhatsApp messages (messages from customers that haven't been read)
    const unreadWhatsApp = whatsappMessages.filter(m => !m.isRead && !m.isFromBusiness).length
    
    return {
      'instagram-comment': unreadComments,
      'instagram-dm': messages.filter(m => !m.isRead).length,
      'whatsapp': unreadWhatsApp,
    }
  }, [messages, comments, whatsappMessages])

  // Handle platform change
  const handlePlatformChange = (platform: Platform | 'all') => {
    setSelectedPlatform(platform)
    setSelectedConversationId(null) // Clear selected conversation when changing platform
  }

  // Handle message selection
  const handleMessageSelect = (message: InstagramMessage) => {
    setSelectedConversationId(message.conversationId)
    
    // Mark all messages in this conversation as read
    // TODO: We should also update this on the backend
    setMessages(prev => 
      prev.map(m => 
        m.conversationId === message.conversationId
          ? { ...m, isRead: true }
          : m
      )
    )
  }

  // Handle sending reply
  const handleSendReply = (messageId: string, reply: string) => {
    // This functionality needs to be connected to the Instagram API
    // For now, we'll just log it.
    console.log('Replying to message:', { messageId, reply });
    alert('Fungsi balas belum terhubung ke API Instagram.');
  }

  // Filter messages based on selected platform
  // Group messages by conversationId, showing only the latest message for each conversation.
  const conversationList = useMemo(() => {
    const conversations = new Map<string, InstagramMessage>();
    messages.forEach(message => {
      const existing = conversations.get(message.conversationId);
      if (!existing || new Date(message.timestamp) > new Date(existing.timestamp)) {
        conversations.set(message.conversationId, message);
      }
    });
    return Array.from(conversations.values());
  }, [messages]);

  // Sort conversations by the timestamp of their latest message
  const sortedMessages = [...conversationList].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

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
        <div className="mb-8">
          <StatsCards stats={stats} />
          <div className="flex items-center justify-end space-x-2 text-sm text-gray-500 mt-4">
            <div className={`w-2 h-2 rounded-full ${isTabActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span>Last update: {isClient ? lastRefresh.toLocaleTimeString() : 'Loading...'}</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex">
          {selectedPlatform === 'instagram-comment' ? (
            /* Instagram Comments Interface */
            <div className="flex-1">
              <CommentsContent />
            </div>
          ) : selectedPlatform === 'whatsapp' ? (
            /* WhatsApp Interface */
            <div className="flex-1">
              <WhatsAppContent />
            </div>
          ) : (
            /* Instagram DM Interface */
            <>
              {/* Message List */}
              <MessageList
                messages={sortedMessages}
                selectedConversationId={selectedConversationId}
                onMessageSelect={handleMessageSelect}
                selectedPlatform={selectedPlatform}
                onRefreshMessages={fetchMessages}
              />

              {/* Message Detail */}
              <MessageDetail
                conversationId={selectedConversationId}
                messages={messages.filter(m => m.conversationId === selectedConversationId)}
                quickReplies={quickReplies}
                onSendReply={handleSendReply}
                onRefreshMessages={fetchMessages}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
