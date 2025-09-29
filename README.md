# Customer Service Dashboard

Aplikasi customer service modern untuk mengelola pesan dari Instagram Comments, Instagram DMs, dan WhatsApp dengan tampilan yang elegan dan fitur lengkap.

## ✨ Fitur

- 📱 **Multi-Platform Support**: Instagram Comments, Instagram DMs, dan WhatsApp
- 📊 **Dashboard Analytics**: Statistik real-time untuk performa customer service
- 🔍 **Search & Filter**: Cari pesan berdasarkan nama atau konten
- ⚡ **Quick Replies**: Template balasan cepat untuk efisiensi
- 🎨 **Modern UI**: Desain yang clean dan responsive
- 📱 **Mobile Friendly**: Tampilan yang optimal di semua device

## 🚀 Teknologi

- **Next.js 14** - React framework dengan App Router
- **TypeScript** - Type safety dan developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Mock Data** - Data statis untuk development

## 📦 Instalasi

1. Install dependencies:
```bash
npm install
```

2. Jalankan development server:
```bash
npm run dev
```

3. Buka [http://localhost:3000](http://localhost:3000) di browser

## 🏗️ Struktur Project

```
src/
├── app/                 # Next.js App Router
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Main dashboard page
├── components/         # React components
│   ├── Sidebar.tsx     # Navigation sidebar
│   ├── StatsCards.tsx  # Statistics cards
│   ├── MessageList.tsx # Message list view
│   └── MessageDetail.tsx # Message detail & reply
├── data/              # Mock data
│   └── mockData.ts    # Sample messages and stats
├── lib/               # Utilities
│   └── utils.ts       # Helper functions
└── types/             # TypeScript definitions
    └── index.ts       # Type definitions
```

## 🎯 Fitur Utama

### Dashboard Overview
- Statistik total pesan, pesan belum dibaca, balasan hari ini
- Waktu respon rata-rata
- Grafik performa mingguan

### Message Management
- Filter berdasarkan platform (Instagram Comment/DM, WhatsApp)
- Search pesan berdasarkan nama atau konten
- Status tracking (Unread, Read, Replied)
- Sortir berdasarkan waktu terbaru

### Reply System
- Interface reply yang intuitif
- Quick reply templates
- Support untuk attachment (UI ready)
- Real-time status update

## 🔮 Roadmap

- [ ] Integrasi dengan Instagram Graph API
- [ ] Integrasi dengan WhatsApp Business API
- [ ] Real-time notifications
- [ ] Advanced analytics dan reporting
- [ ] Team collaboration features
- [ ] Automated responses dengan AI

## 🛠️ Development

```bash
# Development
npm run dev

# Build untuk production
npm run build

# Start production server
npm start

# Linting
npm run lint
```

## 📝 Notes

Aplikasi ini menggunakan data mock untuk development. Untuk production, perlu integrasi dengan:
- Instagram Graph API untuk comments dan DMs
- WhatsApp Business API untuk messages
- Database untuk penyimpanan pesan dan analytics
- Authentication system untuk multi-user

---

**Dibuat dengan ❤️ menggunakan Next.js 14 dan TypeScript**
