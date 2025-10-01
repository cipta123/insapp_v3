import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mediaName = searchParams.get('media')
    
    if (!mediaName) {
      return NextResponse.json(
        { error: 'Missing media parameter' },
        { status: 400 }
      )
    }
    
    console.log('📥 WATZAP_MEDIA: Downloading media:', mediaName)
    
    // For now, return a placeholder image since we don't have the correct Watzap.id media download endpoint
    // In a real implementation, you would need to:
    // 1. Check Watzap.id documentation for correct media download endpoint
    // 2. Or store media files locally when received via webhook
    // 3. Or use a different approach to handle media
    
    // Return a placeholder SVG image
    const placeholderSvg = `
      <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="40%" text-anchor="middle" font-family="Arial" font-size="16" fill="#6b7280">
          WhatsApp Image
        </text>
        <text x="50%" y="60%" text-anchor="middle" font-family="Arial" font-size="12" fill="#9ca3af">
          ${mediaName}
        </text>
        <text x="50%" y="80%" text-anchor="middle" font-family="Arial" font-size="10" fill="#d1d5db">
          Media download not available
        </text>
      </svg>
    `;
    
    return new NextResponse(placeholderSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
      }
    })
    
  } catch (error) {
    console.error('❌ WATZAP_MEDIA: Error:', error)
    return NextResponse.json(
      { error: 'Failed to process media request' },
      { status: 500 }
    )
  }
}
