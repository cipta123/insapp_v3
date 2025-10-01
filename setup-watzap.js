// Setup Watzap.id API and webhook
require('dotenv').config();
const axios = require('axios');

const WATZAP_API_KEY = process.env.WATZAP_API_KEY;
const WATZAP_NUMBER_KEY = process.env.WATZAP_NUMBER_KEY;
const WEBHOOK_URL = 'https://utserang.info/api/webhook'; // Your webhook URL

const setupWatzap = async () => {
  try {
    console.log('🚀 Setting up Watzap.id API...');
    console.log('🔑 API Key:', WATZAP_API_KEY);
    console.log('🔑 Number Key:', WATZAP_NUMBER_KEY);
    
    // Test 1: Check API Status
    console.log('\n🧪 Test 1: Checking API status...');
    
    const statusResponse = await axios({
      method: 'post',
      url: 'https://api.watzap.id/v1/checking_key',
      headers: { 
        'Content-Type': 'application/json'
      },
      data: {
        api_key: WATZAP_API_KEY
      }
    });
    
    console.log('✅ API Status Response:', JSON.stringify(statusResponse.data, null, 2));
    
    // Test 2: Set Webhook
    console.log('\n🧪 Test 2: Setting up webhook...');
    
    const webhookResponse = await axios({
      method: 'post',
      url: 'https://api.watzap.id/v1/set_webhook',
      headers: { 
        'Content-Type': 'application/json'
      },
      data: {
        api_key: WATZAP_API_KEY,
        number_key: WATZAP_NUMBER_KEY,
        endpoint_url: WEBHOOK_URL
      }
    });
    
    console.log('✅ Webhook Setup Response:', JSON.stringify(webhookResponse.data, null, 2));
    
    // Test 3: Get Webhook (verify setup)
    console.log('\n🧪 Test 3: Verifying webhook setup...');
    
    const getWebhookResponse = await axios({
      method: 'post',
      url: 'https://api.watzap.id/v1/get_webhook',
      headers: { 
        'Content-Type': 'application/json'
      },
      data: {
        api_key: WATZAP_API_KEY,
        number_key: WATZAP_NUMBER_KEY
      }
    });
    
    console.log('✅ Current Webhook:', JSON.stringify(getWebhookResponse.data, null, 2));
    
    // Test 4: Send test message (optional - comment out if you don't want to send)
    /*
    console.log('\n🧪 Test 4: Sending test message...');
    
    const testMessageResponse = await axios({
      method: 'post',
      url: 'https://api.watzap.id/v1/send_message',
      headers: { 
        'Content-Type': 'application/json'
      },
      data: {
        api_key: WATZAP_API_KEY,
        number_key: WATZAP_NUMBER_KEY,
        phone_no: '628123456789', // Replace with test number
        message: 'Test message from Watzap.id API integration!'
      }
    });
    
    console.log('✅ Test Message Response:', JSON.stringify(testMessageResponse.data, null, 2));
    */
    
    console.log('\n🎯 Watzap.id setup completed successfully!');
    console.log('📱 Your webhook is now configured to receive messages at:', WEBHOOK_URL);
    console.log('💡 Send a WhatsApp message to your number to test the integration.');
    
  } catch (error) {
    console.error('❌ Setup error:', error.message);
    
    if (error.response) {
      console.error('❌ API Error Response:', error.response.data);
      console.error('❌ API Error Status:', error.response.status);
    }
  }
};

// Run the setup
setupWatzap();
