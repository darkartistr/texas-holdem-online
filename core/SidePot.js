/**
 * SidePot Class
 * Represents a side pot created when players go all-in
 */
class SidePot {
  constructor() {
    this.amount = 0;
    this.players = [];
  }

  /**
   * Add amount to the side pot
   * @param {number} amount - Amount to add
   */
  addAmount(amount) {
    this.amount += amount;
  }

  /**
   * Add eligible player to side pot
   * @param {Player} player - Player object
   */
  addPlayer(player) {
    if (!this.players.includes(player)) {
      this.players.push(player);
    }
  }
}

module.exports = SidePot;
