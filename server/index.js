const express = require('express');
const app = express();
const http = require('http').Server(app);
const path = require('path');
const io = require('socket.io')(http);

const uri = "mongodb://127.0.0.1:27017/test"; //"mongodb+srv://cesar:cards2020@cluster0-931bs.mongodb.net/test?retryWrites=true&w=majority";
const port = process.env.PORT || 5000;

const Game = require('./Game');

const mongoose = require('mongoose');

mongoose.connect(uri, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});


const suits = ["coeur", "pique", "trefle", "carreau"];
const values = ["A", "7", "8", "9", "10", "J", "Q", "K"];


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
    Game.findOne({ ident: ident })
      .then(game => {
        client.emit('update-game', game);
        console.log('[!]#'+ident+' called and sent');
      })
      .catch(err => {
        console.error(err)
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
      console.log('[!]#'+ident,'Current user asked //', (currentPlayer)? currentPlayer.username : currentPlayer );
      client.emit('current-player', currentPlayer);
    });
  });

  client.on('add-mate', (ident, username) => {
    const clientIp = client.request.connection.remoteAddress;
    Game.findOne({ ident: ident }).exec((err, game) => {
      if (err || !game) return console.error(err);
      let currentPlayer;
      if(!game.player1.username){
        game.player1.username = username;
        game.player1.IP = clientIp;
        game.team.T1P1 = username;
        currentPlayer = game.player1;
        console.log('[!]#'+game.ident,'[ADD T1 P1]',username);
      } else if(!game.player2.username){
        game.player2.username = username;
        game.player2.IP = clientIp;
        game.team.T1P2 = username;
        currentPlayer = game.player2;
        console.log('[!]#'+game.ident,'[ADD T1 P2]',username);
      } else if(!game.player3.username){
        game.player3.username = username;
        game.player3.IP = clientIp;
        game.team.T2P1 = username;
        currentPlayer = game.player3;
        console.log('[!]#'+game.ident,'[ADD T2 P1]',username);
      } else if(!game.player4.username){
        game.player4.username = username;
        game.player4.IP = clientIp;
        game.team.T2P2 = username;
        currentPlayer = game.player4;
        console.log('[!]#'+game.ident,'[ADD T2 P1]',username);
      }
      game.save((err) => {
        if (err) return console.error(err);
        io.emit('update-game', game);
        client.emit('current-player', currentPlayer);
        console.log('[!]#'+ident+' updated and sent & currentuser sent');
      });
    });
  });

  client.on('set-choice', (ident, username, choice) => {
    Game.findOne({ ident: ident }).exec((err, game) => {
      if (err || !game) return console.error(err);
      let currentPlayer;
      if(game.player1.username && game.player1.username === username){
        game.player1.choice = choice;
        currentPlayer = game.player1;
        console.log('[!]#'+ident,'[UPDATE P1]',username);
      } else if(game.player2.username && game.player2.username === username){
        game.player2.choice = choice;
        currentPlayer = game.player2;
        console.log('[!]#'+ident,'[UPDATE P2]',username);
      } else if(game.player3.username && game.player3.username === username){
        game.player3.choice = choice;
        currentPlayer = game.player3;
        console.log('[!]#'+ident,'[UPDATE P3]',username);
      } else if(game.player4.username && game.player4.username === username){
        game.player4.choice = choice;
        currentPlayer = game.player4;
        console.log('[!]#'+ident,'[UPDATE P4]',username);
      }

     if(!game.isTeamSet && [game.player1.choice, game.player2.choice, game.player3.choice, game.player4.choice].filter( (el) => el !== undefined ).length === 1) {
        // Si tous les choix sont faits, on initialise le paquet de base du jeu
        for (let i = 0; i < suits.length; i++) {
          for (let x = 0; x < values.length; x++) {
            let card = {value: values[x], suit: suits[i]};
            game.startDeck.push(card);
          }
        }
        // Et on le mélange
        for(let i = game.startDeck.length - 1; i > 0; i--){
          const j = Math.floor(Math.random() * i);
          const temp = game.startDeck[i];
          game.startDeck[i] = game.startDeck[j];
          game.startDeck[j] = temp;
        }

        const choice = getChoice(game);
        if(choice.value === 'king') startSortByKingTeam(io, game);

      } else {
       game.save((err) => {
         if (err) return console.error(err);
         io.emit('update-game', game);
         client.emit('current-player', currentPlayer);
         console.log('[!]#' + ident + ' updated and sent');
       });
     }
    });
  });
});

http.listen(port, () => {
  console.log('listening on *:' + port);
});


function mostRecurring(arr){
  return arr.sort((a,b) =>
    arr.filter(v => v===a).length
    - arr.filter(v => v===b).length
  ).pop();
}

function getChoice(game){
  const choices = [game.player1.choice, game.player2.choice, game.player3.choice, game.player4.choice].filter( (el) => { return el !== ""; });
  const choice = mostRecurring(choices);
  return ( choice === 'king')? {value: 'king', title: 'Tirage des rois'} : {value: 'mate', title: 'Choix de l\'équipier'};
}

function startSortByKingTeam(io, game){
  console.log('[!]#'+game.ident+' starting sort by King team');
  let cmpt = 1;
  game.startDeck.forEach(card => {
    setTimeout(function() {
    if(cmpt === 1){
      game.player1.deck.push(card);
    } else if(cmpt === 2){
      game.player2.deck.push(card);
    } else if(cmpt === 3){
      game.player3.deck.push(card);
    } else if(cmpt === 4){
      game.player4.deck.push(card);
    }
    game.startDeck = game.startDeck.filter((value) => value !== card );
    cmpt += 1;
    if(cmpt === 5) cmpt = 1;
    game.save((err) => {
      if (err) return console.error(err);
      io.emit('update-game', game);
    });
    }, 5000);
  });
}
