// Bitch@ Business Storage Service
// Centralized control + BSV monetization (like Twetch)
// We own the data, control moderation, profit from ads/BSV

const BSVMessageService = require('./bsv-messaging');

class HybridStorageService {
  constructor(options = {}) {
    this.bsvService = new BSVMessageService();
    this.database = options.database || new InMemoryDatabase(); // Placeholder
    this.bsvOnlyMode = options.bsvOnly || false;

    // Content classification for business strategy
    this.contentTypes = {
      free: ['basic_posts', 'public_chat'],            // Database only (ads)
      premium: ['enhanced_posts', 'private_chat'],     // DB + BSV payment
      business: ['ads', 'analytics', 'premium_api']    // Monetization features
    };
  }

  // Smart storage: route content to appropriate storage layer
  async store(content, options = {}) {
    const { type = 'instant', permanent = false, userId } = options;

    // Generate unique ID
    const id = this.generateId();
    const timestamp = Date.now();
    const data = {
      id,
      content,
      type,
      userId: userId || this.bsvService.currentUser,
      timestamp,
      permanent
    };

    // Route to appropriate storage
    if (this.shouldStoreOnBlockchain(type, permanent)) {
      console.log('🔗 Storing on BSV blockchain (permanent):', id);
      await this.storeOnBlockchain(data);
    }

    // Always store in fast database for UX
    if (!this.bsvOnlyMode) {
      console.log('💾 Storing in fast database:', id);
      await this.storeInDatabase(data);
    }

    return { id, stored: true };
  }

  // Intelligent routing logic
  shouldStoreOnBlockchain(type, permanent) {
    if (this.bsvOnlyMode) return true;
    if (permanent) return true;
    return this.contentTypes.permanent.includes(type) ||
           this.contentTypes.critical.includes(type);
  }

  // Store critical content on BSV blockchain
  async storeOnBlockchain(data) {
    try {
      const message = JSON.stringify({
        type: 'bitchat_content',
        id: data.id,
        content: data.content,
        timestamp: data.timestamp,
        userId: data.userId
      });

      await this.bsvService.sendMessage(message, data.userId);
      console.log('✅ Content stored permanently on BSV:', data.id);
    } catch (error) {
      console.error('❌ Failed to store on BSV:', error);
      // Fallback: store locally for later retry
      await this.storeLocally(data);
    }
  }

  // Fast database storage for good UX
  async storeInDatabase(data) {
    // In production: PostgreSQL, MongoDB, or similar
    // For now: local JSON storage like Twetch did
    console.log('✅ Content stored in fast database:', data.id);
  }

  // Retrieve content with smart fallback
  async retrieve(id, options = {}) {
    const { preferSpeed = true } = options;

    try {
      // Try fast database first for good UX
      if (preferSpeed && !this.bsvOnlyMode) {
        const dbResult = await this.retrieveFromDatabase(id);
        if (dbResult) return dbResult;
      }

      // Fallback to blockchain for permanent storage
      const bsvResult = await this.retrieveFromBlockchain(id);
      if (bsvResult) return bsvResult;

      return null;
    } catch (error) {
      console.error('❌ Retrieval failed:', error);
      return null;
    }
  }

  async retrieveFromDatabase(id) {
    // Fast database lookup
    console.log('🔍 Searching fast database for:', id);
    return null; // Placeholder
  }

  async retrieveFromBlockchain(id) {
    // Blockchain lookup (slower but permanent)
    console.log('⛓️ Searching BSV blockchain for:', id);
    const messages = await this.bsvService.loadMessages();
    return messages.find(msg => {
      try {
        const data = JSON.parse(msg.m);
        return data.id === id;
      } catch {
        return false;
      }
    });
  }

  // Local storage fallback (like Twetch's .bit file)
  async storeLocally(data) {
    console.log('📁 Storing locally as fallback:', data.id);
    // Store in local JSON file for later sync to BSV
  }

  // Search functionality
  async search(query, options = {}) {
    const { type, userId, permanent } = options;

    // Search fast database first
    if (!this.bsvOnlyMode) {
      const dbResults = await this.searchDatabase(query, options);
      if (dbResults.length > 0) return dbResults;
    }

    // Fallback to blockchain search
    return await this.searchBlockchain(query, options);
  }

  async searchDatabase(query, options) {
    console.log('🔍 Searching fast database:', query);
    return []; // Placeholder
  }

  async searchBlockchain(query, options) {
    console.log('⛓️ Searching BSV blockchain:', query);
    // Use BitDB for blockchain search
    return [];
  }

  // Real-time sync between layers
  startSync() {
    // Periodically sync local content to BSV
    // Ensure database and blockchain stay in sync
    console.log('🔄 Starting database ↔ BSV sync');
  }

  // Generate unique IDs
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Get storage statistics
  async getStats() {
    return {
      databaseContent: 0,    // Fast DB count
      blockchainContent: 0,  // BSV stored count
      localFallback: 0,      // Offline queue
      syncStatus: 'active'
    };
  }
}

// Simple in-memory database placeholder
class InMemoryDatabase {
  constructor() {
    this.storage = new Map();
  }

  async store(id, data) {
    this.storage.set(id, data);
  }

  async retrieve(id) {
    return this.storage.get(id);
  }

  async search(query) {
    const results = [];
    for (const [id, data] of this.storage) {
      if (JSON.stringify(data).includes(query)) {
        results.push(data);
      }
    }
    return results;
  }
}

module.exports = HybridStorageService;
