import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET(
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

    // Create a zip file of the backup
    const zipPath = path.join(process.cwd(), 'temp', `${backupId}.zip`);
    const tempDir = path.dirname(zipPath);
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    try {
      // Use PowerShell to create zip (Windows built-in)
      const command = `Compress-Archive -Path "${backupDir}\\*" -DestinationPath "${zipPath}" -Force`;
      await execAsync(command, { shell: 'powershell' });
      
      // Read the zip file
      const zipBuffer = fs.readFileSync(zipPath);
      
      // Clean up temp file
      fs.unlinkSync(zipPath);
      
      return new NextResponse(zipBuffer, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="${backupId}.zip"`
        }
      });
      
    } catch (zipError) {
      console.error('Zip creation failed:', zipError);
      return NextResponse.json(
        { error: 'Failed to create backup archive' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Download backup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
