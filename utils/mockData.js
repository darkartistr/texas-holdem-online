const config = require('../config');

/**
 * In-memory mock data store for demo purposes
 * This replaces database operations for the demo project
 */

let users = [];
let nextUserId = 1;

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
};

module.exports = mockDataStore;
