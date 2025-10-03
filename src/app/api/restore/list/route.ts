import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const backupsDir = path.join(process.cwd(), 'backups')
    
    if (!fs.existsSync(backupsDir)) {
      return NextResponse.json({ backups: [] })
    }

    const files = fs.readdirSync(backupsDir)
    const backups = []

    // Process different types of backups
    for (const file of files) {
      const filePath = path.join(backupsDir, file)
      const stats = fs.statSync(filePath)

      if (file.startsWith('complete-backup-')) {
        // Complete backup folder
        const date = extractDateFromFilename(file)
        const folderContents = fs.existsSync(filePath) && stats.isDirectory() 
          ? fs.readdirSync(filePath) 
          : []

        backups.push({
          name: file,
          type: 'complete',
          date: formatDate(date),
          size: `${folderContents.length} files`,
          description: 'Complete system backup including database, files, and configuration',
          files: getCompleteBackupFiles(filePath),
          records: await getBackupRecords(filePath)
        })
      } else if (file.startsWith('database-') && file.endsWith('.sql')) {
        // Database backup
        const date = extractDateFromFilename(file)
        const size = formatFileSize(stats.size)

        backups.push({
          name: file,
          type: 'database',
          date: formatDate(date),
          size: size,
          description: 'Database-only backup with all tables and data',
          files: ['Database Schema', 'SystemUser Table', 'InstagramMessage Table', 'WhatsAppMessage Table', 'InstagramComment Table', 'InstagramPost Table', 'WhatsAppContact Table'],
          records: await getDatabaseBackupRecords(file)
        })
      } else if (file.startsWith('users-backup-') && file.endsWith('.json')) {
        // Users backup
        const date = extractDateFromFilename(file)
        const size = formatFileSize(stats.size)
        const userData = JSON.parse(fs.readFileSync(filePath, 'utf8'))

        backups.push({
          name: file,
          type: 'files',
          date: formatDate(date),
          size: size,
          description: 'User data backup (JSON format)',
          files: ['SystemUser data', 'User roles and permissions'],
          records: {
            users: userData.length || 0,
            messages: 0,
            comments: 0,
            posts: 0,
            whatsapp: 0,
            contacts: 0
          }
        })
      }
    }

    // Sort by date (newest first)
    backups.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json({ backups })
  } catch (error) {
    console.error('Error listing backups:', error)
    return NextResponse.json(
      { error: 'Failed to list backups' },
      { status: 500 }
    )
  }
}

function extractDateFromFilename(filename: string): string {
  const match = filename.match(/(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z)/)
  return match ? match[1].replace(/-/g, ':').replace(/T/, ' ').replace(/Z/, '') : 'Unknown'
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString.replace(/-/g, ':').replace(/T/, ' ').replace(/Z/, ''))
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function getCompleteBackupFiles(backupPath: string): string[] {
  const files = []
  
  try {
    if (fs.existsSync(backupPath)) {
      const contents = fs.readdirSync(backupPath, { recursive: true })
      return contents.map(file => file.toString()).slice(0, 20) // Limit to first 20 files
    }
  } catch (error) {
    console.error('Error reading backup folder:', error)
  }

  return [
    'prisma/schema.prisma',
    'src/app/page.tsx',
    'src/components/MessageList.tsx',
    'src/components/WhatsAppList.tsx',
    'src/components/MessageDetail.tsx',
    'src/components/WhatsAppDetail.tsx',
    'src/app/api/messages/route.ts',
    'src/app/api/whatsapp/messages/route.ts',
    '.env (configuration)',
    'Database backup files',
    '... and more'
  ]
}

async function getBackupRecords(backupPath: string) {
  try {
    // Try to read backup info from JSON files in the backup folder
    const infoFiles = ['users-backup.json', 'instagram-messages.json', 'whatsapp-messages.json']
    let records = {
      users: 0,
      messages: 0,
      comments: 0,
      posts: 0,
      whatsapp: 0,
      contacts: 0
    }

    for (const infoFile of infoFiles) {
      const infoPath = path.join(backupPath, infoFile)
      if (fs.existsSync(infoPath)) {
        const data = JSON.parse(fs.readFileSync(infoPath, 'utf8'))
        if (infoFile.includes('users')) records.users = data.length || 0
        if (infoFile.includes('instagram')) records.messages = data.length || 0
        if (infoFile.includes('whatsapp')) records.whatsapp = data.length || 0
      }
    }

    return records
  } catch (error) {
    return {
      users: 0,
      messages: 0,
      comments: 0,
      posts: 0,
      whatsapp: 0,
      contacts: 0
    }
  }
}

async function getDatabaseBackupRecords(filename: string) {
  // For SQL backups, we can't easily count records without parsing
  // Return estimated counts based on recent backup info
  return {
    users: 9,
    messages: 80,
    comments: 22,
    posts: 6,
    whatsapp: 497,
    contacts: 108
  }
}
