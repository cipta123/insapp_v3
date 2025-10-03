import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Platform } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return 'Baru saja'
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}j`
  if (days < 7) return `${days}h`
  
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short'
  })
}

export function getPlatformColor(platform: Platform): string {
  switch (platform) {
    case 'instagram-comment':
      return 'bg-gradient-to-r from-purple-500 to-pink-500'
    case 'instagram-dm':
      return 'bg-gradient-to-r from-pink-500 to-rose-500'
    case 'whatsapp':
      return 'bg-green-500'
    default:
      return 'bg-gray-500'
  }
}

export function getPlatformName(platform: Platform): string {
  switch (platform) {
    case 'instagram-comment':
      return 'Instagram Comment'
    case 'instagram-dm':
      return 'Instagram DM'
    case 'whatsapp':
      return 'WhatsApp'
    default:
      return 'Unknown'
  }
}
