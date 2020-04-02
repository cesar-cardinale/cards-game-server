import config from './config';
import io from 'socket.io-client';
const socket = io(config[process.env.NODE_ENV].endpoint);

class Game {
  maxPoints;
  isPrivate;
  ident;
  player1 = {
    username: '',
    IP: '',
    choice: ''
  };
  player2 = {
    username: '',
    IP: '',
    choice: ''
  };
  player3 = {
    username: '',
    IP: '',
    choice: ''
  };
  player4 = {
    username: '',
    IP: '',
    choice: ''
  };
  team = {
    T1P1: '',
    T1P2: '',
    T2P1: '',
    T2P2: ''
  };
  isTeamSet = false;
  startDeck = null;

  constructor(ident, isPrivate, maxPoints) {
    this.ident = ident;
    this.isPrivate = isPrivate;
    this.maxPoints = maxPoints;
  }
  send(){
    socket.emit('add-game', this );
  }
  populate(cb){
    socket.emit('get-game', this.ident);
    socket.on('update-game', (game) => cb(Object.assign(new Game(), game)));
  }
  onUpdate(cb){
    socket.on('update-game', (game) => cb(Object.assign(new Game(), game)));
  }
  addMate(username){
    socket.emit('add-mate', this.ident, username);
  }
  getCurrentPlayer(cb){
    socket.emit('current-player', this.ident);
    socket.on('current-player', (player) => cb(player) );
  }
  setChoice(cb, cc, choice, username){
    socket.emit('set-choice', this.ident, username, choice);
    socket.on('update-game', (game) => cb(Object.assign(new Game(), game)));
    socket.on('current-player', (player) => cc(player) );
  }

  getChoice(){
    const choices = [this.player1.choice, this.player2.choice, this.player3.choice, this.player4.choice].filter( (el) => { return el !== ""; });
    const choice = this.mostRecurring(choices);
    return ( choice === 'king')? {value: 'king', title: 'Tirage des rois'} : {value: 'mate', title: 'Choix de l\'équipier'};
  }

  mostRecurring(arr){
    return arr.sort((a,b) =>
      arr.filter(v => v===a).length
      - arr.filter(v => v===b).length
    ).pop();
  }


  static getGameByIdent(ident, cb) {
    socket.emit('getGame', ident);
    socket.on('game', (game) => cb(Object.assign(new Game(), game)) );
  }
}
export { Game };
