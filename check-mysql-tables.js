// Check MySQL Tables directly
const { PrismaClient } = require('@prisma/client');

async function checkMySQLTables() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking MySQL database tables...\n');
    
    // Check if SystemUser table exists by querying it
    try {
      const userCount = await prisma.systemUser.count();
      console.log('✅ SystemUser table EXISTS');
      console.log(`👥 Total users: ${userCount}`);
      
      // Get table info using raw query
      const tableInfo = await prisma.$queryRaw`
        DESCRIBE SystemUser
      `;
      
      console.log('\n📋 SystemUser table structure:');
      tableInfo.forEach(column => {
        console.log(`   - ${column.Field}: ${column.Type} ${column.Null === 'NO' ? '(NOT NULL)' : '(NULLABLE)'} ${column.Key ? `[${column.Key}]` : ''}`);
      });
      
    } catch (error) {
      console.log('❌ SystemUser table does NOT exist');
      console.log('Error:', error.message);
    }
    
    // List all tables in database
    console.log('\n📊 All tables in database:');
    const tables = await prisma.$queryRaw`
      SHOW TABLES
    `;
    
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`${index + 1}. ${tableName}`);
    });
    
    // Check specific users
    console.log('\n👤 Sample users in SystemUser table:');
    const users = await prisma.systemUser.findMany({
      select: {
        username: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      },
      take: 5
    });
    
    users.forEach(user => {
      console.log(`   - ${user.username}: ${user.name} (${user.role}) - Active: ${user.isActive}`);
    });
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkMySQLTables();
