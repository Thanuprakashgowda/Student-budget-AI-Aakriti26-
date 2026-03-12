const axios = require('axios');

const URL = `http://localhost:5000/whatsapp/webhook`;

const testMessages = [
  { Body: '200 snacks', From: 'whatsapp:+919876543210' },
  { Body: '120 bus', From: 'whatsapp:+919876543210' },
  { Body: 'delete', From: 'whatsapp:+919876543210' }
];

async function runTest() {
  console.log('🚀 Testing WhatsApp Webhook...');
  for (const msg of testMessages) {
    try {
      console.log(`📝 Sending: "${msg.Body}"`);
      await axios.post(URL, msg);
      console.log('✅ Success!\n');
    } catch (err) {
      console.error('❌ Error:', err.message);
    }
  }
}

runTest();
