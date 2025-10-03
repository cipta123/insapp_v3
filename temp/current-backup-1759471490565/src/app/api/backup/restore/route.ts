import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { backupId, type } = await request.json();
    
    if (!backupId || !type) {
      return NextResponse.json(
        { error: 'Backup ID and type are required' },
        { status: 400 }
      );
    }

    const backupDir = path.join(process.cwd(), 'backups', backupId);
    
    if (!fs.existsSync(backupDir)) {
      return NextResponse.json(
        { error: 'Backup not found' },
        { status: 404 }
      );
    }

    let success = false;
    let error = null;
    const restoredItems = [];

    try {
      // Restore database if included
      if (type === 'complete' || type === 'database') {
        const dbBackupPath = path.join(backupDir, 'database-backup.sql');
        
        if (fs.existsSync(dbBackupPath)) {
          console.log('🔄 Restoring database...');
          
          // Use mysql command to restore database
          const mysqlPath = 'C:\\xampp\\mysql\\bin\\mysql.exe';
          const command = `"${mysqlPath}" -u root insapp_v3`;
          
          // Read the SQL file and execute it
          const sqlContent = fs.readFileSync(dbBackupPath, 'utf-8');
          
          // For safety, we'll create a temporary SQL file with DROP/CREATE commands
          const tempSqlPath = path.join(process.cwd(), 'temp', 'restore-temp.sql');
          const restoreSql = `
-- Restore from backup: ${backupId}
DROP DATABASE IF EXISTS insapp_v3_restore_temp;
CREATE DATABASE insapp_v3_restore_temp;
USE insapp_v3_restore_temp;

${sqlContent}

-- Switch databases (manual step required)
-- DROP DATABASE insapp_v3;
-- CREATE DATABASE insapp_v3;
-- USE insapp_v3;
-- SOURCE this file again after manual verification
          `;
          
          fs.writeFileSync(tempSqlPath, restoreSql);
          
          // For now, we'll just validate the backup file exists and is readable
          console.log('✅ Database backup validated and prepared for restore');
          restoredItems.push('Database backup prepared (manual verification required)');
        }
      }

      // Restore files if included
      if (type === 'complete' || type === 'files') {
        console.log('🔄 Restoring files...');
        
        // Restore source files
        const srcBackupDir = path.join(backupDir, 'src');
        if (fs.existsSync(srcBackupDir)) {
          // Create backup of current files first
          const currentBackupDir = path.join(process.cwd(), 'temp', `current-backup-${Date.now()}`);
          if (!fs.existsSync(currentBackupDir)) {
            fs.mkdirSync(currentBackupDir, { recursive: true });
          }
          
          // Backup current src directory
          if (fs.existsSync('./src')) {
            await copyDirectory('./src', path.join(currentBackupDir, 'src'));
          }
          
          // Restore from backup
          await copyDirectory(srcBackupDir, './src');
          restoredItems.push('Source files restored');
        }

        // Restore configuration files
        const configFiles = ['.env', 'package.json', 'next.config.js', 'tailwind.config.js'];
        for (const file of configFiles) {
          const backupFilePath = path.join(backupDir, file);
          if (fs.existsSync(backupFilePath)) {
            // Backup current file first
            if (fs.existsSync(file)) {
              fs.copyFileSync(file, `${file}.backup-${Date.now()}`);
            }
            fs.copyFileSync(backupFilePath, file);
            restoredItems.push(`${file} restored`);
          }
        }
      }

      success = true;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error';
      console.error('Restore error:', err);
    }

    return NextResponse.json({
      success,
      error,
      restoredItems,
      message: success 
        ? `Restore completed. Items restored: ${restoredItems.join(', ')}` 
        : 'Restore failed',
      warning: type.includes('database') 
        ? 'Database restore requires manual verification. Check temp/restore-temp.sql' 
        : null
    });

  } catch (error) {
    console.error('Restore API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function copyDirectory(src: string, dest: string) {
  if (!fs.existsSync(src)) return;
  
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const items = fs.readdirSync(src);
  
  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    
    if (fs.statSync(srcPath).isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
