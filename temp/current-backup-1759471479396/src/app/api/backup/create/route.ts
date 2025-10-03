import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { type } = await request.json();
    
    if (!['complete', 'database', 'files'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid backup type' },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupId = `${type}-backup-${timestamp}`;
    const backupDir = path.join(process.cwd(), 'backups', backupId);

    // Ensure backup directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    let success = false;
    let error = null;

    try {
      if (type === 'complete' || type === 'database') {
        // Create database backup
        const dbBackupPath = path.join(backupDir, 'database-backup.sql');
        const mysqldumpPath = 'C:\\xampp\\mysql\\bin\\mysqldump.exe';
        
        const command = `"${mysqldumpPath}" -u root insapp_v3`;
        
        try {
          const { stdout } = await execAsync(command);
          fs.writeFileSync(dbBackupPath, stdout);
          console.log('Database backup created successfully');
        } catch (error) {
          console.error('Database backup failed:', error);
          throw error;
        }
      }

      if (type === 'complete' || type === 'files') {
        // Copy source code and configuration
        const srcBackupDir = path.join(backupDir, 'src');
        const prismaBackupDir = path.join(backupDir, 'prisma');
        
        const currentDir = process.cwd();
        const srcPath = path.join(currentDir, 'src');
        const prismaPath = path.join(currentDir, 'prisma');
        
        console.log(`Copying from ${srcPath} to ${srcBackupDir}`);
        console.log(`Copying from ${prismaPath} to ${prismaBackupDir}`);
        
        await copyDirectory(srcPath, srcBackupDir);
        await copyDirectory(prismaPath, prismaBackupDir);
        
        // Copy configuration files
        const configFiles = ['.env', 'package.json', 'next.config.js', 'tailwind.config.js'];
        for (const file of configFiles) {
          if (fs.existsSync(file)) {
            const filePath = path.join(currentDir, file);
            const destPath = path.join(backupDir, file);
            fs.copyFileSync(filePath, destPath);
            console.log(`Copied file: ${file}`);
          }
        }
      }

      // Create backup metadata
      const metadata = {
        id: backupId,
        type,
        created: new Date().toISOString(),
        status: 'success',
        size: await getDirectorySize(backupDir)
      };

      fs.writeFileSync(
        path.join(backupDir, 'metadata.json'),
        JSON.stringify(metadata, null, 2)
      );

      success = true;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error';
    }

    return NextResponse.json({
      success,
      backupId,
      error,
      message: success ? 'Backup created successfully' : 'Backup failed'
    });

  } catch (error) {
    console.error('Backup creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function copyDirectory(src: string, dest: string) {
  if (!fs.existsSync(src)) {
    console.log(`Source directory does not exist: ${src}`);
    return;
  }
  
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const items = fs.readdirSync(src);
  console.log(`Copying ${items.length} items from ${src} to ${dest}`);
  
  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    
    try {
      if (fs.statSync(srcPath).isDirectory()) {
        await copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied file: ${item}`);
      }
    } catch (error) {
      console.error(`Error copying ${item}:`, error);
    }
  }
}

async function getDirectorySize(dirPath: string): Promise<string> {
  try {
    let totalSize = 0;
    
    const calculateSize = (dir: string) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          calculateSize(itemPath);
        } else {
          totalSize += stats.size;
        }
      }
    };
    
    calculateSize(dirPath);
    
    // Convert to human readable format
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = totalSize;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  } catch {
    return 'Unknown';
  }
}
