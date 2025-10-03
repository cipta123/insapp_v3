import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const backupId = params.id;
    const backupDir = path.join(process.cwd(), 'backups', backupId);
    
    if (!fs.existsSync(backupDir)) {
      return NextResponse.json(
        { error: 'Backup not found' },
        { status: 404 }
      );
    }

    // Recursively delete backup directory
    const deleteDirectory = (dir: string) => {
      if (fs.existsSync(dir)) {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
          const itemPath = path.join(dir, item);
          
          if (fs.statSync(itemPath).isDirectory()) {
            deleteDirectory(itemPath);
          } else {
            fs.unlinkSync(itemPath);
          }
        }
        
        fs.rmdirSync(dir);
      }
    };

    deleteDirectory(backupDir);

    return NextResponse.json({
      success: true,
      message: 'Backup deleted successfully'
    });

  } catch (error) {
    console.error('Delete backup error:', error);
    return NextResponse.json(
      { error: 'Failed to delete backup' },
      { status: 500 }
    );
  }
}
