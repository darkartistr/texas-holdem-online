const { CS_FOLD, CS_CHECK, CS_RAISE, WINNER, CS_CALL } = require('./actions');

/**
 * Seat Class
 * Represents a seat at the poker table with a player and their game state
 */
class Seat {
  /**
   * Create a new Seat instance
   * @param {number} id - Seat number (1-5)
   * @param {Player} player - Player object
   * @param {number} buyin - Initial buy-in amount
   * @param {number} stack - Starting chip stack
   */
  constructor(id, player, buyin, stack) {
    this.id = id;
    this.player = player;
    this.buyin = buyin;
    this.stack = stack;
    this.hand = [];
    this.bet = 0;
    this.turn = false;
    this.checked = true;
    this.folded = true;
    this.lastAction = null;
    this.sittingOut = false;
  }

  /**
   * Fold the hand
   */
  fold() {
    this.bet = 0;
    this.folded = true;
    this.lastAction = CS_FOLD;
    this.turn = false;
  }

  /**
   * Check action (pass when no bet to call)
   */
  check() {
    this.checked = true;
    this.lastAction = CS_CHECK;
    this.turn = false;
  }

  /**
   * Raise the bet
   * @param {number} amount - Total bet amount (including previous bet)
   * @returns {boolean} True if raise was successful
   */
  raise(amount) {
    const reRaiseAmount = amount - this.bet;
    if (reRaiseAmount > this.stack) {
      return false; // Insufficient chips
    }

    this.bet = amount;
    this.stack -= reRaiseAmount;
    this.turn = false;
    this.lastAction = CS_RAISE;
    return true;
  }

  /**
   * Place blind bet
   * @param {number} amount - Blind amount
   */
  placeBlind(amount) {
    this.bet = amount;
    this.stack -= amount;
  }

  /**
   * Call the current bet
   * @param {number} amount - Amount to call
   */
  callRaise(amount) {
    let amountCalled = amount - this.bet;
    if (amountCalled >= this.stack) {
      amountCalled = this.stack; // All-in
    }

    this.bet += amountCalled;
    this.stack -= amountCalled;
    this.turn = false;
    this.lastAction = CS_CALL;
  }

  /**
   * Award pot winnings to this seat
   * @param {number} amount - Amount won
   */
  winHand(amount) {
    this.bet = 0;
    this.stack += amount;
    this.turn = false;
    this.lastAction = WINNER;
  }
}

module.exports = Seat;
