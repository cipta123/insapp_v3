import { Message, QuickReply, Stats } from '@/types';

export const mockMessages: Message[] = [
  // Instagram Comments
  {
    id: '1',
    platform: 'instagram-comment',
    sender: {
      name: 'Sarah Johnson',
      username: '@sarahjohnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    content: 'Produk ini bagus banget! Kapan restock warna pink?',
    timestamp: new Date('2024-01-15T10:30:00'),
    status: 'unread',
    postId: 'post_123',
    postImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop'
  },
  {
    id: '2',
    platform: 'instagram-comment',
    sender: {
      name: 'Ahmad Rizki',
      username: '@ahmadrizki',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    content: 'Harga berapa ya kak? Ada diskon gak?',
    timestamp: new Date('2024-01-15T09:15:00'),
    status: 'read',
    postId: 'post_124',
    postImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop'
  },
  {
    id: '3',
    platform: 'instagram-comment',
    sender: {
      name: 'Maya Sari',
      username: '@mayasari',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    },
    content: 'Pengiriman ke Surabaya berapa hari?',
    timestamp: new Date('2024-01-15T08:45:00'),
    status: 'replied',
    postId: 'post_125',
    postImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    replies: [
      {
        id: 'reply_1',
        content: 'Untuk pengiriman ke Surabaya estimasi 2-3 hari kerja menggunakan JNE/J&T. Terima kasih! 📦',
        timestamp: new Date('2024-01-15T09:00:00'),
        sender: 'agent'
      }
    ]
  },

  // Instagram DMs
  {
    id: '4',
    platform: 'instagram-dm',
    sender: {
      name: 'Budi Santoso',
      username: '@budisantoso',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    content: 'Halo, saya mau tanya tentang produk yang di post kemarin. Masih ada stock?',
    timestamp: new Date('2024-01-15T11:20:00'),
    status: 'unread'
  },
  {
    id: '5',
    platform: 'instagram-dm',
    sender: {
      name: 'Lisa Wijaya',
      username: '@lisawijaya',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
    },
    content: 'Kak, saya sudah transfer tapi belum dapat konfirmasi. Mohon dicek ya',
    timestamp: new Date('2024-01-15T10:50:00'),
    status: 'unread'
  },
  {
    id: '6',
    platform: 'instagram-dm',
    sender: {
      name: 'Rudi Hermawan',
      username: '@rudihermawan',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
    },
    content: 'Terima kasih ya kak, barangnya sudah sampai dan sesuai ekspektasi!',
    timestamp: new Date('2024-01-15T09:30:00'),
    status: 'replied',
    replies: [
      {
        id: 'reply_2',
        content: 'Alhamdulillah, senang mendengarnya! Terima kasih sudah berbelanja di toko kami. Jangan lupa follow untuk update produk terbaru ya! 😊',
        timestamp: new Date('2024-01-15T09:45:00'),
        sender: 'agent'
      }
    ]
  },

  // WhatsApp Messages
  {
    id: '7',
    platform: 'whatsapp',
    sender: {
      name: 'Siti Nurhaliza',
      username: '+62812-3456-7890',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'
    },
    content: 'Selamat pagi, saya mau order 2 pcs yang warna biru. Bisa COD area Jakarta Selatan?',
    timestamp: new Date('2024-01-15T11:45:00'),
    status: 'unread'
  },
  {
    id: '8',
    platform: 'whatsapp',
    sender: {
      name: 'Andi Pratama',
      username: '+62813-9876-5432',
      avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face'
    },
    content: 'Kak, produk yang saya pesan kapan dikirim? Sudah 3 hari belum ada update tracking',
    timestamp: new Date('2024-01-15T10:15:00'),
    status: 'read'
  },
  {
    id: '9',
    platform: 'whatsapp',
    sender: {
      name: 'Dewi Lestari',
      username: '+62814-5555-1234',
      avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face'
    },
    content: 'Alhamdulillah paketnya sudah sampai dengan selamat. Makasih ya kak!',
    timestamp: new Date('2024-01-15T08:20:00'),
    status: 'replied'
  }
];

export const quickReplies: QuickReply[] = [
  {
    id: 'qr1',
    title: 'Terima Kasih',
    content: 'Terima kasih sudah menghubungi kami! 😊'
  },
  {
    id: 'qr2',
    title: 'Cek Stock',
    content: 'Halo! Untuk ketersediaan stock, mohon tunggu sebentar ya, saya cek dulu 🙏'
  },
  {
    id: 'qr3',
    title: 'Info Pengiriman',
    content: 'Untuk pengiriman, kami menggunakan JNE/J&T/SiCepat. Estimasi 2-3 hari kerja untuk Jabodetabek 📦'
  },
  {
    id: 'qr4',
    title: 'Konfirmasi Pembayaran',
    content: 'Terima kasih sudah melakukan pembayaran. Kami akan segera proses pesanan Anda 💳'
  },
  {
    id: 'qr5',
    title: 'Maaf Menunggu',
    content: 'Mohon maaf atas keterlambatan respon kami. Terima kasih atas kesabarannya 🙏'
  }
];

export const stats: Stats = {
  totalMessages: 156,
  unreadMessages: 23,
  repliedToday: 45,
  responseTime: '2.5 menit'
};
