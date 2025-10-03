export type Platform = 'instagram-comment' | 'instagram-dm' | 'whatsapp';

export type MessageStatus = 'unread' | 'read' | 'replied';

export interface Reply {
  id: string;
  content: string;
  timestamp: Date;
  sender: 'customer' | 'agent';
}

export interface Message {
  id: string;
  platform: Platform;
  sender: {
    name: string;
    username: string;
    avatar?: string;
  };
  content: string;
  timestamp: Date;
  status: MessageStatus;
  postId?: string; // For Instagram comments
  postImage?: string; // For Instagram comments
  replies?: Reply[]; // Conversation history
}

export interface QuickReply {
  id: string;
  title: string;
  content: string;
  platform?: Platform; // If undefined, applies to all platforms
}

export interface Stats {
  totalMessages: number;
  unreadMessages: number;
  repliedToday: number;
  responseTime: string;
}
