const config = require('../config');

/**
 * In-memory mock data store for demo purposes
 * This replaces database operations for the demo project
 */

let users = [];
let nextUserId = 1;

let ledger = [];
let nextLedgerId = 1;

/**
 * Initialize mock data with demo users
 */
const initializeMockData = () => {
  users = [
    {
      id: '1',
      name: 'Demo Player 1',
      email: 'player1@demo.com',
      password: 'hashed_password_demo', // In production, this would be hashed
      chipsAmount: config.INITIAL_CHIPS_AMOUNT,
      type: 0,
      created: new Date(),
    },
    {
      id: '2',
      name: 'Demo Player 2',
      email: 'player2@demo.com',
      password: 'hashed_password_demo',
      chipsAmount: config.INITIAL_CHIPS_AMOUNT,
      type: 0,
      created: new Date(),
    },
  ];
  nextUserId = 3;

  const now = Date.now();
  ledger = [
    {
      id: '1',
      userId: '1',
      type: 'deposit',
      amount: 100000,
      balanceAfter: 100000,
      description: 'Initial chips allocation',
      reference: 'seed_1',
      created: new Date(now - 1000 * 60 * 60 * 24 * 3).toISOString(),
    },
    {
      id: '2',
      userId: '1',
      type: 'bet',
      amount: 5000,
      balanceAfter: 95000,
      description: 'Cash game buy-in',
      reference: 'table_buyin',
      created: new Date(now - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
    {
      id: '3',
      userId: '1',
      type: 'win',
      amount: 12500,
      balanceAfter: 107500,
      description: 'Tournament payout',
      reference: 'tournament_1024',
      created: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: '4',
      userId: '2',
      type: 'bonus',
      amount: 10000,
      balanceAfter: 110000,
      description: 'Daily login reward',
      reference: 'daily_bonus',
      created: new Date(now - 1000 * 60 * 60 * 12).toISOString(),
    },
  ];
  nextLedgerId = 5;
};

// Initialize on module load
initializeMockData();

/**
 * Mock Data Store
 * Provides database-like operations for demo purposes
 */
const mockDataStore = {
  users: {
    /**
     * Find user by ID
     * @param {string} id - User ID
     * @returns {Object|null} User object or null
     */
    findById: (id) => {
      if (!id) return null;
      return users.find((user) => user.id === String(id)) || null;
    },

    /**
     * Find user by query (email or name)
     * @param {Object} query - Query object with email or name
     * @returns {Object|null} User object or null
     */
    findOne: (query) => {
      if (!query) return null;

      if (query.email) {
        return users.find((user) => user.email.toLowerCase() === query.email.toLowerCase().trim()) || null;
      }
      if (query.name) {
        return users.find((user) => user.name.toLowerCase() === query.name.toLowerCase().trim()) || null;
      }
      return null;
    },

    /**
     * Create new user
     * @param {Object} userData - User data object
     * @returns {Object} Created user object
     */
    create: (userData) => {
      if (!userData || !userData.email || !userData.name) {
        throw new Error('Invalid user data');
      }

      const newUser = {
        id: String(nextUserId++),
        name: userData.name.trim(),
        email: userData.email.toLowerCase().trim(),
        password: userData.password,
        chipsAmount: userData.chipsAmount || config.INITIAL_CHIPS_AMOUNT,
        type: userData.type || 0,
        created: new Date(),
      };

      users.push(newUser);
      return newUser;
    },

    /**
     * Update user by ID
     * @param {string} id - User ID
     * @param {Object} updateData - Data to update
     * @returns {Object|null} Updated user object or null
     */
    update: (id, updateData) => {
      if (!id || !updateData) return null;

      const userIndex = users.findIndex((user) => user.id === String(id));
      if (userIndex === -1) return null;

      // Merge update data with existing user
      users[userIndex] = {
        ...users[userIndex],
        ...updateData,
        // Preserve immutable fields
        id: users[userIndex].id,
        created: users[userIndex].created,
      };

      return users[userIndex];
    },

    /**
     * Get user without sensitive password field
     * @param {Object} user - User object
     * @returns {Object|null} User object without password
     */
    getUserWithoutPassword: (user) => {
      if (!user) return null;
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    },

    /**
     * Get all users (for admin purposes)
     * @returns {Array} Array of users without passwords
     */
    findAll: () => {
      return users.map((user) => mockDataStore.users.getUserWithoutPassword(user));
    },

    /**
     * Reset mock data to initial state
     */
    reset: () => {
      initializeMockData();
    },
  },
  
  ledger: {
    
    findAll: (query = {}) => {
      const {
        userId,
        type,
        fromDate,
        toDate,
        minAmount,
        maxAmount,
        search,
        cursor,
        limit = 20,
      } = query;

      const parsedLimit = Number(limit);
      const safeLimit = Number.isFinite(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, 100)
        : 20;

      let filtered = [...ledger];

      if (userId) {
        filtered = filtered.filter((entry) => entry.userId === String(userId));
      }

      if (type) {
        filtered = filtered.filter((entry) => entry.type === type);
      }

      if (fromDate) {
        const fromDateValue = new Date(fromDate).getTime();
        filtered = filtered.filter((entry) => {
          const entryDate = new Date(entry.created).getTime();
          return entryDate >= fromDateValue;
        });
      }

      if (toDate) {
        const toDateValue = new Date(toDate).getTime();
        filtered = filtered.filter((entry) => {
          const entryDate = new Date(entry.created).getTime();
          return entryDate <= toDateValue;
        });
      }

      if (minAmount !== undefined) {
        const minAmountValue = Number(minAmount);
        filtered = filtered.filter((entry) => entry.amount >= minAmountValue);
      }

      if (maxAmount !== undefined) {
        const maxAmountValue = Number(maxAmount);
        filtered = filtered.filter((entry) => entry.amount <= maxAmountValue);
      }

      if (search) {
        const term = String(search).toLowerCase().trim();
        filtered = filtered.filter((entry) => {
          const description = String(entry.description || '').toLowerCase();
          const reference = String(entry.reference || '').toLowerCase();
          return description.includes(term) || reference.includes(term);
        });
      }

      filtered.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

      let startIndex = 0;
      if (cursor) {
        const cursorIndex = filtered.findIndex((entry) => entry.id === String(cursor));
        startIndex = cursorIndex >= 0 ? cursorIndex + 1 : 0;
      }

      const items = filtered.slice(startIndex, startIndex + safeLimit);
      const hasMore = startIndex + safeLimit < filtered.length;
      const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].id : null;

      return {
        items,
        pagination: {
          limit: safeLimit,
          nextCursor,
          hasMore,
          total: filtered.length,
        },
      };
    },

    findById: (id) => {
      if (!id) return null;
      return ledger.find((entry) => entry.id === String(id)) || null;
    },
  }
};

module.exports = mockDataStore;
