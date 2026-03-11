/**
 * Player Class
 * Represents a player in the poker game
 */
class Player {
  /**
   * Create a new Player instance
   * @param {string} socketId - Socket.IO socket ID
   * @param {string} playerId - Unique player identifier
   * @param {string} playerName - Player's display name
   * @param {number} chipsAmount - Initial chip amount
   */
  constructor(socketId, playerId, playerName, chipsAmount) {
    this.socketId = socketId;
    this.id = playerId;
    this.name = playerName;
    this.bankroll = chipsAmount;
  }
}

module.exports = Player;
