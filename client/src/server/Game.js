const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  maxPoints:  Number,
  isPrivate: Boolean,
  ident: String,
  player1: {
    username: String,
    IP: String,
    choice: String,
    deck: [{
      value: String,
      suit: String
    }]
  },
  player2: {
    username: String,
    IP: String,
    choice: String,
    deck: [{
      value: String,
      suit: String
    }]
  },
  player3: {
    username: String,
    IP: String,
    choice: String,
    deck: [{
      value: String,
      suit: String
    }]
  },
  player4: {
    username: String,
    IP: String,
    choice: String,
    deck: [{
      value: String,
      suit: String
    }]
  },
  team: {
      T1P1: String,
      T1P2: String,
      T2P1: String,
      T2P2: String
    },
  isTeamSet: Boolean,
  startDeck: [{
    value: String,
    suit: String
  }]
});

module.exports = mongoose.model('Game', gameSchema);
