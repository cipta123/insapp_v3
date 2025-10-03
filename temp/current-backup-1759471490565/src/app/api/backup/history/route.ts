import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const backupsDir = path.join(process.cwd(), 'backups');
    
    if (!fs.existsSync(backupsDir)) {
      return NextResponse.json({ backups: [] });
    }

    const backupFolders = fs.readdirSync(backupsDir)
      .filter(item => {
        const itemPath = path.join(backupsDir, item);
        return fs.statSync(itemPath).isDirectory();
      });

    const backups = [];

    for (const folder of backupFolders) {
      const metadataPath = path.join(backupsDir, folder, 'metadata.json');
      
      if (fs.existsSync(metadataPath)) {
        try {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
          
          backups.push({
            id: metadata.id || folder,
            name: folder,
            date: new Date(metadata.created || fs.statSync(path.join(backupsDir, folder)).birthtime).toLocaleString(),
            size: metadata.size || 'Unknown',
            type: metadata.type || 'unknown',
            status: metadata.status || 'success'
          });
        } catch (error) {
          // If metadata is corrupted, create basic info
          const stats = fs.statSync(path.join(backupsDir, folder));
          backups.push({
            id: folder,
            name: folder,
            date: stats.birthtime.toLocaleString(),
            size: 'Unknown',
            type: folder.includes('complete') ? 'complete' : 
                  folder.includes('database') ? 'database' : 'files',
            status: 'success'
          });
        }
      }
    }

    // Sort by date (newest first)
    backups.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ backups });

  } catch (error) {
    console.error('Failed to fetch backup history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch backup history' },
      { status: 500 }
    );
  }
}
