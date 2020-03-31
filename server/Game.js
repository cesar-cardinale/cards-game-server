const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  maxPoints:  Number,
  isPrivate: Boolean,
  ident: String,
  player1: {
    username: String,
    IP: String,
    choice: String,
  },
  player2: {
    username: String,
    IP: String,
    choice: String,
  },
  player3: {
    username: String,
    IP: String,
    choice: String,
  },
  player4: {
    username: String,
    IP: String,
    choice: String,
  },
  team: {
      T1P1: String,
      T1P2: String,
      T2P1: String,
      T2P2: String,
    },
  isTeamSet: Boolean,
});

module.exports = mongoose.model('Game', gameSchema);
