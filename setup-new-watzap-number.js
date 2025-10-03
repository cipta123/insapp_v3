// Setup New Watzap Number - Run this after changing WATZAP_NUMBER_KEY
require('dotenv').config();
const axios = require('axios');

const WATZAP_API_KEY = process.env.WATZAP_API_KEY;
const WATZAP_NUMBER_KEY = process.env.WATZAP_NUMBER_KEY;
const WEBHOOK_URL = 'https://utserang.info/api/webhook';

const setupNewWatzapNumber = async () => {
  try {
    console.log('🚀 Setting up NEW Watzap Number...');
    console.log('🔑 API Key:', WATZAP_API_KEY);
    console.log('🔑 NEW Number Key:', WATZAP_NUMBER_KEY);
    console.log('🌐 Webhook URL:', WEBHOOK_URL);
    console.log('='.repeat(60));
    
    // Step 1: Check API Key Status
    console.log('\n1️⃣ Checking API Key status...');
    
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
    
    console.log('✅ API Key Status:', statusResponse.data);
    
    // Step 2: Setup Webhook for NEW Number
    console.log('\n2️⃣ Setting up webhook for NEW number...');
    
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
    
    console.log('✅ Webhook Setup Response:', webhookResponse.data);
    
    // Step 3: Verify Webhook Configuration
    console.log('\n3️⃣ Verifying webhook configuration...');
    
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
    
    console.log('✅ Current Webhook Config:', getWebhookResponse.data);
    
    // Step 4: Test Number Status
    console.log('\n4️⃣ Checking number status...');
    
    try {
      const numberStatusResponse = await axios({
        method: 'post',
        url: 'https://api.watzap.id/v1/get_status',
        headers: { 
          'Content-Type': 'application/json'
        },
        data: {
          api_key: WATZAP_API_KEY,
          number_key: WATZAP_NUMBER_KEY
        }
      });
      
      console.log('✅ Number Status:', numberStatusResponse.data);
    } catch (error) {
      console.log('⚠️  Number status check failed:', error.response?.data || error.message);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 NEW WATZAP NUMBER SETUP COMPLETED!');
    console.log('='.repeat(60));
    console.log('📱 Your NEW WhatsApp number is now configured');
    console.log('🌐 Webhook URL:', WEBHOOK_URL);
    console.log('🔑 Number Key:', WATZAP_NUMBER_KEY);
    console.log('\n💡 Next Steps:');
    console.log('1. Send a test message to your NEW WhatsApp number');
    console.log('2. Check webhook logs for incoming messages');
    console.log('3. Test reply functionality from the dashboard');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    
    if (error.response) {
      console.error('❌ API Error Response:', JSON.stringify(error.response.data, null, 2));
      console.error('❌ API Error Status:', error.response.status);
      
      // Common error solutions
      console.log('\n🔧 Troubleshooting:');
      if (error.response.status === 401) {
        console.log('- Check if WATZAP_API_KEY is correct');
      }
      if (error.response.data?.message?.includes('number_key')) {
        console.log('- Check if WATZAP_NUMBER_KEY is correct');
        console.log('- Make sure the number is registered with Watzap.id');
      }
      if (error.response.data?.message?.includes('webhook')) {
        console.log('- Check if webhook URL is accessible');
        console.log('- Verify webhook URL format');
      }
    }
  }
};

// Run the setup
setupNewWatzapNumber();
