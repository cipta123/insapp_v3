// Enable WhatsApp Auto-Polling Script
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/WhatsAppContent.tsx');

console.log('🔄 Enabling WhatsApp auto-polling...');

try {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace the disabled polling code
  const oldCode = `    // Disable auto-refresh temporarily to fix scroll issue
    // const interval = setInterval(() => {
    //   fetchMessages()
    // }, 3000)

    // return () => clearInterval(interval)`;
    
  const newCode = `    // Enable auto-polling every 3 seconds with tab visibility detection
    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchMessages()
        console.log('🔄 WHATSAPP_POLLING: Auto-refresh executed')
      } else {
        console.log('⏸️ WHATSAPP_POLLING: Tab inactive, skipping poll')
      }
    }, 3000)

    return () => {
      clearInterval(interval)
      console.log('🛑 WHATSAPP_POLLING: Polling stopped')
    }`;
  
  if (content.includes('// Disable auto-refresh temporarily')) {
    content = content.replace(oldCode, newCode);
    
    // Add polling indicator to header
    content = content.replace(
      'WhatsApp Chats',
      `WhatsApp Chats
              <RefreshCw className="h-4 w-4 ml-2 text-green-500 animate-pulse" title="Auto-refresh active" />`
    );
    
    // Add RefreshCw to imports if not present
    if (!content.includes('RefreshCw')) {
      content = content.replace(
        'import { MessageCircle, Send, Phone, User, Clock, Check, CheckCheck, Image, FileText, Mic, Video }',
        'import { MessageCircle, Send, Phone, User, Clock, Check, CheckCheck, Image, FileText, Mic, Video, RefreshCw }'
      );
    }
    
    fs.writeFileSync(filePath, content);
    console.log('✅ WhatsApp auto-polling enabled successfully!');
    console.log('📱 WhatsApp chat will now auto-refresh every 3 seconds');
    console.log('⏸️ Polling pauses when tab is inactive (smart optimization)');
    console.log('🔄 Restart your server to see the changes');
  } else {
    console.log('⚠️  Auto-polling code not found or already enabled');
  }
  
} catch (error) {
  console.error('❌ Error enabling auto-polling:', error.message);
}
