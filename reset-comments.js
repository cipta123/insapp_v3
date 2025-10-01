// Reset comment reply status for testing
const { PrismaClient } = require('@prisma/client');

const resetComments = async () => {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Resetting comment reply status...');
    
    // Reset all comments to not replied
    const result = await prisma.instagramComment.updateMany({
      data: {
        isReplied: false
      }
    });
    
    console.log(`✅ Reset ${result.count} comments to not replied status`);
    
    // Show current comments
    const comments = await prisma.instagramComment.findMany({
      select: {
        commentId: true,
        text: true,
        username: true,
        isReplied: true
      },
      orderBy: {
        timestamp: 'desc'
      }
    });
    
    console.log('\n📝 Current comments status:');
    comments.forEach(comment => {
      console.log(`- ${comment.username}: "${comment.text}" - Replied: ${comment.isReplied}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
};

resetComments();
