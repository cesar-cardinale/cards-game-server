const express = require('express');
const app = express();
const http = require('http').Server(app);
const path = require('path');
const io = require('socket.io')(http);

const uri = "mongodb+srv://cesar:cards2020@cluster0-931bs.mongodb.net/test?retryWrites=true&w=majority";
const port = process.env.PORT || 5000;

const Game = require('./Game');

const mongoose = require('mongoose');

mongoose.connect(uri, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

io.on('connection', (client) => {
  client.on('add-game', (gameReceived) => {
    const game = new Game();
    game.maxPoints = gameReceived.maxPoints;
    game.isPrivate = gameReceived.isPrivate;
    game.ident = gameReceived.ident;
    game.save((err) => {
      if (err) return console.error(err);
      console.log('[!]#'+game.ident+' added');
    });
  });

  client.on('get-game', (ident) => {
    Game.findOne({ ident: ident }).exec((err, game) => {
      if (err) return console.error(err);
      client.emit('update-game', game);
      console.log('[!]#'+game.ident+' called and sent');
    });
  });

  client.on('current-player', (ident) => {
    const clientIp = client.request.connection.remoteAddress;
    Game.findOne({ ident: ident }).exec((err, game) => {
      if (err) return console.error(err);

      let currentPlayer = null;
      if(game.player1.username && game.player1.IP === clientIp){
        currentPlayer = game.player1;
      } else if(game.player2.username && game.player2.IP === clientIp){
        currentPlayer = game.player2;
      } else if(game.player3.username && game.player3.IP === clientIp){
        currentPlayer = game.player3;
      } else if(game.player4.username && game.player4.IP === clientIp){
        currentPlayer = game.player4;
      }
      console.log('[!]#'+game.ident,'Current user asked //', (currentPlayer)? currentPlayer.username : currentPlayer );
      client.emit('current-player', currentPlayer);
    });
  });

  client.on('add-mate', (ident, username) => {
    const clientIp = client.request.connection.remoteAddress;
    Game.findOne({ ident: ident }).exec((err, game) => {
      if (err || !game) return console.error(err);
      if(!game.player1.username){
        game.player1.username = username;
        game.player1.IP = clientIp;
        game.team.T1P1 = username;
        console.log('[!]#'+game.ident,'[ADD T1 P1]',username);
      } else if(!game.player2.username){
        game.player2.username = username;
        game.player2.IP = clientIp;
        game.team.T1P2 = username;
        console.log('[!]#'+game.ident,'[ADD T1 P2]',username);
      } else if(!game.player3.username){
        game.player3.username = username;
        game.player3.IP = clientIp;
        game.team.T2P1 = username;
        console.log('[!]#'+game.ident,'[ADD T2 P1]',username);
      } else if(!game.player4.username){
        game.player4.username = username;
        game.player4.IP = clientIp;
        game.team.T2P2 = username;
        console.log('[!]#'+game.ident,'[ADD T2 P1]',username);
      }
      game.save((err) => {
        if (err) return console.error(err);
        io.emit('update-game', game);
        console.log('[!]#'+game.ident+' updated');
      });
    });
  });

  client.on('set-choice', (ident, username, choice) => {
    Game.findOne({ ident: ident }).exec((err, game) => {
      if (err || !game) return console.error(err);
      if(game.player1.username && game.player1.username === username){
        game.player1.choice = choice;
        console.log('[!]#'+ident,'[UPDATE P1]',username);
      } else if(game.player2.username && game.player2.username === username){
        game.player2.choice = choice;
        console.log('[!]#'+ident,'[UPDATE P2]',username);
      } else if(game.player3.username && game.player3.username === username){
        game.player3.choice = choice;
        console.log('[!]#'+ident,'[UPDATE P3]',username);
      } else if(game.player4.username && game.player4.username === username){
        game.player4.choice = choice;
        console.log('[!]#'+ident,'[UPDATE P4]',username);
      }
      game.save((err) => {
        if (err) return console.error(err);
        io.emit('update-game', game);
        console.log('[!]#'+game.ident+' updated');
      });
    });
  });
});

http.listen(port, () => {
  console.log('listening on *:' + port);
});
