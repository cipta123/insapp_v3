import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const prisma = new PrismaClient();
  
  try {
    // Get database statistics
    const [
      totalMessages,
      totalComments, 
      totalWhatsApp
    ] = await Promise.all([
      prisma.instagramMessage.count(),
      prisma.instagramComment.count(),
      (prisma as any).whatsAppMessage?.count() || Promise.resolve(0)
    ]);

    // Get last backup date
    let lastBackup = null;
    const backupsDir = path.join(process.cwd(), 'backups');
    
    if (fs.existsSync(backupsDir)) {
      const backupFolders = fs.readdirSync(backupsDir)
        .filter(item => {
          const itemPath = path.join(backupsDir, item);
          return fs.statSync(itemPath).isDirectory();
        })
        .map(folder => {
          const folderPath = path.join(backupsDir, folder);
          return {
            name: folder,
            created: fs.statSync(folderPath).birthtime
          };
        })
        .sort((a, b) => b.created.getTime() - a.created.getTime());

      if (backupFolders.length > 0) {
        lastBackup = backupFolders[0].created.toISOString();
      }
    }

    return NextResponse.json({
      totalMessages,
      totalComments,
      totalWhatsApp,
      lastBackup
    });

  } catch (error) {
    console.error('Failed to fetch system stats:', error);
    return NextResponse.json(
      { 
        totalMessages: 0,
        totalComments: 0, 
        totalWhatsApp: 0,
        lastBackup: null
      },
      { status: 200 } // Return empty stats instead of error
    );
  } finally {
    await prisma.$disconnect();
  }
}
