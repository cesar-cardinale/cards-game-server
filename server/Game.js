const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  maxPoints:  Number,
  isPrivate: Boolean,
  ident: String,
}, {
  player1: String,
  player2: String,
  player3: String,
  player4: String,
  team: String,
  isTeamSet: Boolean,
});

module.exports = mongoose.model('Game', gameSchema);
