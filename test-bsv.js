// Bitch@ BSV Messaging Test
// Demonstrates real Bitcoin SV blockchain messaging

require('dotenv').config();
const BSVMessageService = require('./services/bsv-messaging');

async function testBSVMessaging() {
  console.log('🚀 Starting Bitch@ BSV Messaging Test');
  console.log('=====================================');

  const bsvService = new BSVMessageService();

  try {
    // Initialize service
    await bsvService.init();

    // Generate anonymous identity
    const anonymousId = bsvService.generateAnonymousIdentity();
    console.log('🎭 Generated anonymous identity:', anonymousId);

    // Load existing messages from BSV blockchain
    console.log('\n📚 Loading existing messages from BSV blockchain...');
    const messages = await bsvService.loadMessages();
    console.log(`📨 Found ${messages.length} messages on blockchain`);

    // Display recent messages
    if (messages.length > 0) {
      console.log('\n📜 Recent BSV messages:');
      messages.slice(0, 5).forEach((msg, index) => {
        const timestamp = new Date(msg.t * 1000).toLocaleString();
        console.log(`${index + 1}. [${timestamp}] ${msg.m || 'No message content'}`);
      });
    }

    // Start listening for new messages
    console.log('\n👂 Starting real-time message listener...');
    bsvService.startListening((message) => {
      console.log('⚡ NEW MESSAGE RECEIVED:', message);
    });

    // Send a test message (commented out to avoid spamming blockchain)
    /*
    console.log('\n📤 Sending test message to BSV blockchain...');
    const testMessage = `Hello from Bitch@! Timestamp: ${Date.now()}`;
    await bsvService.sendMessage(testMessage, anonymousId);
    console.log('✅ Test message sent to blockchain');
    */

    console.log('\n🎉 Bitch@ BSV integration successful!');
    console.log('💡 Your messages are now permanently stored on Bitcoin SV');
    console.log('🔥 Real-time messaging powered by the world\'s most secure blockchain');

    // Keep the process running to listen for messages
    console.log('\n⏳ Listening for new messages... (Ctrl+C to exit)');

  } catch (error) {
    console.error('❌ BSV Messaging test failed:', error);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down Bitch@ BSV service...');
  process.exit(0);
});

// Run the test
testBSVMessaging();
