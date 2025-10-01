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
    
    // Try to download media from Watzap.id
    // Note: This is a guess at the API endpoint - need to check actual Watzap.id docs
    try {
      const mediaResponse = await axios({
        method: 'post',
        url: 'https://api.watzap.id/v1/download_media', // This might be the correct endpoint
        headers: { 
          'Content-Type': 'application/json'
        },
        data: {
          api_key: process.env.WATZAP_API_KEY,
          number_key: process.env.WATZAP_NUMBER_KEY,
          media_name: mediaName
        },
        responseType: 'arraybuffer' // For binary data
      })
      
      // Return the media file
      return new NextResponse(mediaResponse.data, {
        headers: {
          'Content-Type': mediaResponse.headers['content-type'] || 'image/jpeg',
          'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
        }
      })
      
    } catch (apiError) {
      console.log('⚠️ WATZAP_MEDIA: API download failed, trying direct URL approach')
      
      // Alternative: Try to construct direct URL (if Watzap.id provides direct URLs)
      const directUrl = `https://api.watzap.id/media/${mediaName}` // This is a guess
      
      try {
        const directResponse = await axios({
          method: 'get',
          url: directUrl,
          responseType: 'arraybuffer'
        })
        
        return new NextResponse(directResponse.data, {
          headers: {
            'Content-Type': directResponse.headers['content-type'] || 'image/jpeg',
            'Cache-Control': 'public, max-age=3600'
          }
        })
        
      } catch (directError) {
        console.error('❌ WATZAP_MEDIA: Both API and direct URL failed')
        
        // Return placeholder image
        return NextResponse.json({
          error: 'Media not available',
          placeholder: true,
          mediaName
        }, { status: 404 })
      }
    }
    
  } catch (error) {
    console.error('❌ WATZAP_MEDIA: Error downloading media:', error)
    return NextResponse.json(
      { error: 'Failed to download media' },
      { status: 500 }
    )
  }
}
