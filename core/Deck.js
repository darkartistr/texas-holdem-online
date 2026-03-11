/**
 * Deck Class
 * Manages a standard 52-card deck with shuffle and draw functionality
 */
class Deck {
  constructor() {
    this.suits = ['s', 'h', 'd', 'c']; // Spades, Hearts, Diamonds, Clubs
    this.ranks = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
    this.cards = this.createDeckAndShuffle();
  }

  /**
   * Create a standard 52-card deck and shuffle it multiple times
   * @returns {Array} Shuffled array of card objects
   */
  createDeckAndShuffle() {
    const cards = [];

    // Create all 52 cards
    this.suits.forEach((suit) => {
      this.ranks.forEach((rank) => {
        cards.push({ suit, rank });
      });
    });

    // Shuffle multiple times for better randomness
    for (let i = 0; i < 7; i++) {
      this.shuffle(cards);
    }

    return cards;
  }

  /**
   * Fisher-Yates shuffle algorithm
   * @param {Array} array - Array to shuffle
   */
  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * Get the number of remaining cards in the deck
   * @returns {number} Number of cards remaining
   */
  count() {
    return this.cards.length;
  }

  /**
   * Draw a random card from the deck
   * @returns {Object|null} Card object {suit, rank} or null if deck is empty
   */
  draw() {
    const count = this.count();
    if (count > 0) {
      const randomIndex = Math.floor(Math.random() * count);
      return this.cards.splice(randomIndex, 1)[0];
    }
    return null;
  }
}

module.exports = Deck;
