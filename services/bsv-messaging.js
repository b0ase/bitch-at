// Bitch@ BSV Messaging Service
// Based on unwriter/bitchat - Real Bitcoin SV blockchain messaging
// Messages stored permanently as OP_RETURN transactions

const axios = require('axios');
const EventSource = require('eventsource');

class BSVMessageService {
  constructor() {
    this.bitsocket = null;
    this.bitpipeUrl = process.env.BITPIPE_URL || 'http://localhost:8082/bitpipe';

    // BitDB query for reading messages from BSV blockchain
    this.query = {
      "v": 3,
      "q": {
        "find": {
          "out.b0": { "op": 106 }, // OP_RETURN
          "out.b1": { "op": 0 }    // Null data
        },
        "limit": 200
      },
      "r": {
        "f": "[.[] | { m: .out[0].s2, t: .timestamp, h: .tx.h, sender: .out[0].s3 }]"
      }
    };

    // BitSocket query for real-time message listening
    this.sock = {
      "v": 3,
      "q": {
        "find": {
          "out.b0": { "op": 106 },
          "out.b1": { "op": 0 }
        }
      },
      "r": {
        "f": "[.[] | { m: .out[0].s2, t: .timestamp, h: .tx.h, sender: .out[0].s3 }]"
      }
    };
  }

  // Initialize BSV messaging service
  async init() {
    console.log('🔥 Bitch@ BSV Messaging Service initialized');
    console.log('📝 Messages stored permanently on Bitcoin SV blockchain');
    console.log('⚡ Real-time updates via BitSocket');
  }

  // Load existing messages from BSV blockchain via BitDB
  async loadMessages() {
    try {
      const queryString = JSON.stringify(this.query);
      const b64 = Buffer.from(queryString).toString('base64');
      const bitdbUrl = 'https://chronos.bitdb.network/q/1P6o45vqLdo6X8HRCZk8XuDsniURmXqiXo/' + b64;

      const response = await axios.get(bitdbUrl, {
        headers: {
          key: "13cJQeQ7WTQMCUbPLi2juqCrZpqdpMJm5Y" // BitDB API key
        }
      });

      return response.data.t.reverse(); // Return messages in chronological order
    } catch (error) {
      console.error('❌ Error loading messages from BSV:', error);
      return [];
    }
  }

  // Start real-time message listening via BitSocket
  startListening(onMessage) {
    const b64 = Buffer.from(JSON.stringify(this.sock)).toString("base64");
    const bitsocketUrl = 'https://chronos.bitdb.network/s/1P6o45vqLdo6X8HRCZk8XuDsniURmXqiXo/' + b64;

    this.bitsocket = new EventSource(bitsocketUrl);

    this.bitsocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 't' && data.data && data.data.length > 0) {
        // New message received
        const message = data.data[0];
        console.log('📨 New BSV message:', message);
        if (onMessage) {
          onMessage(message);
        }
      }
    };

    this.bitsocket.onerror = (error) => {
      console.error('❌ BitSocket connection error:', error);
    };

    console.log('👂 Listening for new BSV messages...');
  }

  // Send message to BSV blockchain via BitPipe
  async sendMessage(content, sender = 'anonymous@bitchat.com') {
    try {
      const payload = {
        data: ["", content, sender] // OP_RETURN data format
      };

      const response = await axios.post(this.bitpipeUrl, payload);
      console.log('✅ Message sent to BSV blockchain:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error sending message to BSV:', error);
      throw error;
    }
  }

  // Stop listening for messages
  stopListening() {
    if (this.bitsocket) {
      this.bitsocket.close();
      console.log('🔇 Stopped listening for BSV messages');
    }
  }

  // Get message history for a specific user/channel
  async getMessageHistory(filter = {}) {
    // TODO: Implement filtering by sender, time range, etc.
    return await this.loadMessages();
  }

  // Create anonymous bitch@ identity
  generateAnonymousIdentity() {
    const randomId = Math.random().toString(36).substring(2, 15);
    return `bitch@${randomId}.com`;
  }

  // Validate BSV transaction hash
  async validateTransaction(txHash) {
    try {
      const response = await axios.get(`https://api.whatsonchain.com/v1/bsv/main/tx/${txHash}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error validating BSV transaction:', error);
      return null;
    }
  }
}

module.exports = BSVMessageService;
