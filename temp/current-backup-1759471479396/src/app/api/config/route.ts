import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const CONFIG_FILE_PATH = path.join(process.cwd(), 'config.json')

interface ConfigData {
  instagram: {
    accessToken: string
    appId: string
    appSecret: string
    pageId: string
    webhookVerifyToken: string
  }
  whatsapp: {
    accessToken: string
    phoneNumberId: string
    businessAccountId: string
    webhookVerifyToken: string
    appId: string
    appSecret: string
  }
}

const defaultConfig: ConfigData = {
  instagram: {
    accessToken: process.env.INSTAGRAM_ACCESS_TOKEN || '',
    appId: process.env.INSTAGRAM_APP_ID || '',
    appSecret: process.env.INSTAGRAM_APP_SECRET || '',
    pageId: process.env.INSTAGRAM_PAGE_ID || '',
    webhookVerifyToken: process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || ''
  },
  whatsapp: {
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
    webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || '',
    appId: process.env.WHATSAPP_APP_ID || '',
    appSecret: process.env.WHATSAPP_APP_SECRET || ''
  }
}

function loadConfig(): ConfigData {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const configData = fs.readFileSync(CONFIG_FILE_PATH, 'utf8')
      return { ...defaultConfig, ...JSON.parse(configData) }
    }
  } catch (error) {
    console.error('Error loading config:', error)
  }
  return defaultConfig
}

function saveConfig(config: ConfigData): boolean {
  try {
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2))
    
    // Update environment variables dynamically
    process.env.INSTAGRAM_ACCESS_TOKEN = config.instagram.accessToken
    process.env.INSTAGRAM_APP_ID = config.instagram.appId
    process.env.INSTAGRAM_APP_SECRET = config.instagram.appSecret
    process.env.INSTAGRAM_PAGE_ID = config.instagram.pageId
    process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN = config.instagram.webhookVerifyToken
    
    process.env.WHATSAPP_ACCESS_TOKEN = config.whatsapp.accessToken
    process.env.WHATSAPP_PHONE_NUMBER_ID = config.whatsapp.phoneNumberId
    process.env.WHATSAPP_BUSINESS_ACCOUNT_ID = config.whatsapp.businessAccountId
    process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN = config.whatsapp.webhookVerifyToken
    process.env.WHATSAPP_APP_ID = config.whatsapp.appId
    process.env.WHATSAPP_APP_SECRET = config.whatsapp.appSecret
    
    return true
  } catch (error) {
    console.error('Error saving config:', error)
    return false
  }
}

export async function GET() {
  try {
    const config = loadConfig()
    
    // Return actual config for now (we'll add masking later)
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error in GET /api/config:', error)
    return NextResponse.json(
      { error: 'Failed to load configuration' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const config: ConfigData = await request.json()
    
    // Validate required fields
    const requiredInstagramFields = ['accessToken', 'appId', 'pageId']
    const requiredWhatsAppFields = ['accessToken', 'phoneNumberId', 'businessAccountId']
    
    for (const field of requiredInstagramFields) {
      if (!config.instagram[field as keyof typeof config.instagram]) {
        return NextResponse.json(
          { error: `Instagram ${field} is required` },
          { status: 400 }
        )
      }
    }
    
    for (const field of requiredWhatsAppFields) {
      if (!config.whatsapp[field as keyof typeof config.whatsapp]) {
        return NextResponse.json(
          { error: `WhatsApp ${field} is required` },
          { status: 400 }
        )
      }
    }
    
    // Save configuration
    const success = saveConfig(config)
    
    if (success) {
      return NextResponse.json({ 
        message: 'Configuration saved successfully',
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to save configuration' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in POST /api/config:', error)
    return NextResponse.json(
      { error: 'Invalid request data' },
      { status: 400 }
    )
  }
}
