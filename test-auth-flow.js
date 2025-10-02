// Test complete authentication flow
const puppeteer = require('puppeteer');

async function testAuthFlow() {
  console.log('🚀 Starting authentication flow test...');
  
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: false, 
      devtools: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      console.log('🌐 BROWSER:', msg.text());
    });
    
    // Go to login page
    console.log('📱 Navigating to login page...');
    await page.goto('http://localhost:3000/login');
    
    // Wait for page to load
    await page.waitForSelector('input[type="text"]');
    
    // Fill login form
    console.log('📝 Filling login form...');
    await page.type('input[type="text"]', 'direktur1');
    await page.type('input[type="password"]', 'direktur123');
    
    // Click login button
    console.log('🔐 Clicking login button...');
    await page.click('button[type="submit"]');
    
    // Wait for navigation or error
    console.log('⏳ Waiting for response...');
    await page.waitForTimeout(5000);
    
    // Check current URL
    const currentUrl = page.url();
    console.log('📍 Current URL:', currentUrl);
    
    if (currentUrl.includes('/login')) {
      console.log('❌ Still on login page - login failed or redirected back');
    } else {
      console.log('✅ Successfully redirected to dashboard!');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'login-test-result.png' });
    console.log('📸 Screenshot saved as login-test-result.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Check if puppeteer is available
try {
  testAuthFlow();
} catch (error) {
  console.log('⚠️  Puppeteer not available, skipping browser test');
  console.log('💡 You can test manually by visiting: http://localhost:3000/login');
  console.log('📋 Use credentials: direktur1 / direktur123');
}
