import React from 'react';
import { BrowserRouter, Route } from "react-router-dom";
import { Game } from './Game';

import logo from './assets/img/logo.png';
import logoWhite from './assets/img/logo_w.png';
import load from './assets/img/load.gif';

import './assets/css/App.css';
import './assets/css/FontAwesome.css';

class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <Route exact path="/" component={Menu}/>
        <Route exact path="/Contree" component={ContreeMenu}/>
        <Route exact path="/Contree/Start" component={ContreeStart}/>
        <Route exact path="/Contree/Join/:ident" component={ContreeUsername}/>
        <Route exact path="/Contree/Play/:ident" component={ContreePlay}/>
        <Route exact path="/Belote" component={BeloteMenu}/>
      </BrowserRouter>
    );
  }
}
{ /*
class App_EXAMPLE extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      chat: [],
      content: '',
      name: '',
    };
  }

  componentDidMount() {
    this.socket = io(config[process.env.NODE_ENV].endpoint);

    // Load the last 10 messages in the window.
    this.socket.on('init', (msg) => {
      this.setState((state) => ({
        chat: [...state.chat, ...msg.reverse()],
      }), this.scrollToBottom);
    });

    // Update the chat if a new message is broadcasted.
    this.socket.on('push', (msg) => {
      this.setState((state) => ({
        chat: [...state.chat, msg],
      }), this.scrollToBottom);
    });
  }

  // Save the message the user is typing in the input field.
  handleContent(event) {
    this.setState({
      content: event.target.value,
    });
  }

  //
  handleName(event) {
    this.setState({
      name: event.target.value,
    });
  }

  // When the user is posting a new message.
  handleSubmit(event) {
    console.log(event);

    // Prevent the form to reload the current page.
    event.preventDefault();

    this.setState((state) => {
      console.log(state);
      console.log('this', this.socket);
      // Send the new message to the server.
      this.socket.emit('message', {
        name: state.name,
        content: state.content,
      });

      // Update the chat with the user's message and remove the current message.
      return {
        chat: [...state.chat, {
          name: state.name,
          content: state.content,
        }],
        content: '',
      };
    }, this.scrollToBottom);
  }

  // Always make sure the window is scrolled down to the last message.
  scrollToBottom() {
    const chat = document.getElementById('chat');
    chat.scrollTop = chat.scrollHeight;
  }

  render() {
    return (
      <div className="App">
        <Paper id="chat" elevation={3}>
          {this.state.chat.map((el, index) => {
            return (
              <div key={index}>
                <Typography variant="caption" className="name">
                  {el.name}
                </Typography>
                <Typography variant="body1" className="content">
                  {el.content}
                </Typography>
              </div>
            );
          })}
        </Paper>
        <BottomBar
          content={this.state.content}
          handleContent={this.handleContent.bind(this)}
          handleName={this.handleName.bind(this)}
          handleSubmit={this.handleSubmit.bind(this)}
          name={this.state.name}
        />
      </div>
    );
  }
} */ }

class Menu extends React.Component {
  render()  {
    return (
      <div className="box menu">
        <Logo />
        <Button link="/Contree" classTitle="game" text="Contrée" />
        {/* <Button link="/Belote" classTitle="game" text="Belote" /> */}
      </div>
    );
  }
}

class ContreeMenu extends React.Component {
  render()  {
    return (
      <div className="box contree">
        <Logo />
        <h2>Contrée</h2>
        <div className="sep"/>
        <BackButton link="/"/>
        <Button link="/Contree/Start" classTitle="create" text="Créer une partie" />
        <Button link="/Contree/Join" classTitle="join" text="Rejoindre une partie" />
      </div>
    );
  }
}
class ContreeStart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {private: true, maxPoints: 400};

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  componentDidMount(){
    document.title = "Contrée - Création";
  }

  handleInputChange(event) {
    const target = event.target;
    let tmp;
    if(target.name === 'private' && target.checked){
      tmp = 1;
    } else if(target.name === 'private' && !target.checked){
      tmp = 0;
    } else {
      tmp = parseInt(Math.round(target.value / 50) * 50);
    }
    const value = tmp;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    if(this.state.maxPoints >= 400){
      let ident = Math.random().toString(36).substring(2, 10);
      const game = new Game(ident, this.state.private, this.state.maxPoints);
      game.send();
      this.props.history.replace('/Contree/Join/'+game.ident);
    }
  }
  render()  {
    return (
      <div className="box contree start">
        <Logo />
        <h2>Contrée</h2>
        <div className="sep"/>
        <BackButton link="/Contree"/>
        <h3>Création de la partie</h3>
        <form onSubmit={this.handleSubmit}>
          <label>
            Partie privée
            <input
              name="private"
              type="checkbox"
              checked={this.state.private}
              onChange={this.handleInputChange} />
          </label>
          <div className="private">Si cette case est cochée, seuls les joueurs disposant du lien pourront rejoindre cette partie.</div>
          <br />
          <label>
            Nombre max de points à atteindre
            <input
              name="maxPoints"
              type="number"
              min="400"
              step="50"
              value={this.state.maxPoints}
              onChange={this.handleInputChange} />
          </label>
          <input type="submit" className="button" value="Créer" />
        </form>
      </div>
    );
  }
}

class ContreeUsername extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ident: this.props.match.params.ident,
      game: new Game(this.props.match.params.ident, null, null),
      username: "",
      currentPlayer: null,
      cantContinue: true
    };

    this.handleLiveGame = this.handleLiveGame.bind(this);
    this.handleCurrentPlayer = this.handleCurrentPlayer.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  componentDidMount(){
    document.title = "Contrée - Partie #"+this.state.game.ident;
    this.state.game.populate( this.handleLiveGame );
    this.state.game.getCurrentPlayer(this.handleCurrentPlayer);
  }
  handleLiveGame(game){
    this.setState((state) => ({game: Object.assign(state.game, game)}) );
    if(this.state.game.player1.username && this.state.game.player2.username && this.state.game.player3.username && this.state.game.player4.username){
      document.getElementById('buttonCapacity').classList.add('show');
      document.getElementById('form').style.display = 'none';
      document.querySelector('h3').style.display = 'none';
    }
    if(this.state.game.ident !== this.state.ident) this.props.history.replace('/Contree');
  }

  handleCurrentPlayer(player){
    this.setState((state, props) => ({ currentPlayer: player }));
    if(this.state.currentPlayer !== null) this.props.history.replace('/Contree/Play/'+this.state.game.ident);
  }

  handleChange(event) {
    const target = event.target;
    const value = target.value.replace(/\s/g, '').toLowerCase();

    this.setState({ username: value });
    let found = false;
    if( (this.state.game.player1 && this.state.game.player1.username === value) ||
      (this.state.game.player2 && this.state.game.player2.username === value) ||
      (this.state.game.player3 && this.state.game.player3.username === value) ||
      (this.state.game.player4 && this.state.game.player4.username === value) ){
      found = true;
    }
    if(found){
      document.getElementById('used').classList.add('show');
      this.setState({ cantContinue: true });
    } else if(value.length < 5){
      document.getElementById('used').classList.remove('show');
      this.setState({ cantContinue: true });
    } else{
      document.getElementById('used').classList.remove('show');
      this.setState({ cantContinue: false });
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    this.state.game.addMate(this.state.username);
    this.props.history.replace('/Contree/Play/'+this.state.ident);
  }

  render()  {
    return (
      <div className="box contree username">
        <Logo />
        <h2>Contrée</h2>
        <div className="sep"/>
        <h3>Joindre la partie #{this.state.ident}</h3>
        <div className="sep"/>
        <h3>Nom d'utilisateur</h3>
        <form id="form" onSubmit={this.handleSubmit}>
          <input type="text" name="username" value={this.state.username} onChange={this.handleChange} />
          <div id="used"><span>{this.state.username}</span> est déjà utilisé</div>
          <input type="submit" id="buttonStart" className="button" value="Commencer" disabled={this.state.cantContinue} />
        </form>
        <span id="buttonCapacity">
				<BackButton link="/Contree"/>
				<div className="button start">Cette partie est déjà pleine, vous ne pouvez pas la rejoindre</div>
				</span>
      </div>
    );
  }
}

class ContreePlay extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ident: this.props.match.params.ident,
      game: new Game(this.props.match.params.ident, null, null),
      currentPlayer: undefined
    };
    this.handleLiveGame = this.handleLiveGame.bind(this);
    this.handleCurrentPlayer = this.handleCurrentPlayer.bind(this);
    this.getMate = this.getMate.bind(this);
    this.chooseKing = this.chooseKing.bind(this);
    this.chooseMate = this.chooseMate.bind(this);
  }
  componentDidMount(){
    this.state.game.populate(this.handleLiveGame);
    this.state.game.onUpdate(this.handleLiveGame);
    this.state.game.getCurrentPlayer(this.handleCurrentPlayer);
    document.title = "Contrée - Partie #"+this.state.game.ident;
    document.querySelector('html').style.backgroundColor = "#3F3F3F";
    document.querySelector('.logo img').setAttribute("src", logoWhite);
  }
  handleLiveGame(game){
    this.setState((state) => ({game: Object.assign(state.game, game)}) );
    if(this.state.game.ident !== this.state.ident) this.props.history.replace('/Contree');
  }
  handleCurrentPlayer(player){
    this.setState((state, props) => ({ currentPlayer: player }));
    this.checkIfFull();
    if(this.state.currentPlayer === undefined) this.props.history.replace('/Contree/Join/'+this.state.game.ident);
  }
  checkIfFull(){
    if(this.state.game.player1.username && this.state.game.player2.username && this.state.game.player3.username && this.state.game.player4.username && !this.state.game.isTeamSet){
      document.querySelector('#wait h2').textContent = 'Choix des équipes';
      if(!this.state.currentPlayer.choice)  document.querySelector('#choice').style.display = 'block';
    }
  }
  getMate(place){
    const team = this.state.game.team;
    if(this.state.currentPlayer !== null && this.state.currentPlayer !== undefined && place === 'me'){
      return( this.state.currentPlayer );
    }
    if(this.state.currentPlayer !== null && this.state.currentPlayer !== undefined){
      let selectedUser;
      let myTeam = 0;
      let myPlayerPlace = 0;
      const username = this.state.currentPlayer.username;
      if(this.state.game.team.T1P1 && this.state.game.team.T1P1 === username){
        myTeam = 1;
        myPlayerPlace = 1;
        selectedUser = this.state.game.team.T1P2;
      } else if(this.state.game.team.T1P2 && this.state.game.team.T1P2 === username){
        myTeam = 1;
        myPlayerPlace = 2;
        selectedUser = this.state.game.team.T1P1;
      } else if(this.state.game.team.T2P1 && this.state.game.team.T2P1 === username){
        myTeam = 2;
        myPlayerPlace = 1;
        selectedUser = this.state.game.team.T2P2;
      } else if(this.state.game.team.T2P2 && this.state.game.team.T2P2 === username){
        myTeam = 2;
        myPlayerPlace = 2;
        selectedUser = this.state.game.team.T2P1;
      }
      if(selectedUser && place === 'mate'){
        return this.player(selectedUser);
      }
      if(myTeam !== 2 && (place === 'first' || place === 'second') ){
        if(this.state.game.T2P1 && this.state.game.T2P1 !== username && place === 'first') return this.player(this.state.game.T2P1);
        if(this.state.game.T2P2 && this.state.game.T2P2 !== username && place === 'second') return this.player(this.state.game.T2P2);
      } else if(myTeam !== 1 && (place === 'first' || place === 'second') ){
        if(this.state.game.T1P1 && this.state.game.T1P1 !== username && place === 'first') return this.player(this.state.game.T1P1);
        if(this.state.game.T1P2 && this.state.game.T1P2 !== username && place === 'second') return this.player(this.state.game.T1P2);
      }
    }
    return( {username: "", IP: null, choice: null} );
  }

  player(username){
    if(this.state.game.player1.username && this.state.game.player1.username === username){
      return this.state.game.player1;
    } else if(this.state.game.player2.username && this.state.game.player2.username === username){
      return this.state.game.player2;
    } else if(this.state.game.player3.username && this.state.game.player3.username === username){
      return this.state.game.player3;
    } else if(this.state.game.player4.username && this.state.game.player4.username === username){
      return this.state.game.player4;
    }
  }

  chooseKing(){
    this.state.game.setChoice(this.handleLiveGame, 'king', this.state.currentPlayer.username);
    document.querySelector('#choice').remove();
  }
  chooseMate(){
    this.state.game.setChoice(this.handleLiveGame, 'mate', this.state.currentPlayer.username);
    document.querySelector('#choice').remove();
  }
  render()  {
    console.log('JEU', this.state.game);
    const me = this.getMate('me');
    const mate = this.getMate('mate');
    const adv1 = this.getMate('first');
    const adv2 = this.getMate('second');
    return (
      <div className="box contree play">
        <Logo />
        <h2>Contrée - Partie #{this.state.game.ident}</h2>
        <div className="sep"/>
        <BackButton link="/Contree/Join"/>
        <InputShareLink link={`/Contree/Join/${this.state.game.ident}`} />
        <div id="wait">
          <h2>En attente de tous les joueurs ...</h2>
          <div className="players">
            <div className="player">
              <div className="avatar"><Avatar username={me.username} /></div>
              <p>Joueur 1 (moi)</p>
              {me.username}
              <ChoiceFlag user={me}/>
            </div>
            <div className="player">
              <div className="avatar"><Avatar username={mate.username} /></div>
              <p>Joueur 2</p>
              {mate.username}
              <ChoiceFlag user={mate}/>
            </div>
            <div className="player">
              <div className="avatar"><Avatar username={adv1.username} /></div>
              <p>Joueur 3</p>
              {adv1.username}
              <ChoiceFlag user={adv1}/>
            </div>
            <div className="player">
              <div className="avatar"><Avatar username={adv2.username} /></div>
              <p>Joueur 4</p>
              {adv2.username}
              <ChoiceFlag user={adv2}/>
            </div>
          </div>
          <div id="choice">
            <ChoiceButton classTitle="first" event={this.chooseKing} text="Tirer les rois" />
            <ChoiceButton classTitle="" event={this.chooseMate} text="Choisir son équipier" />
          </div>
        </div>
      </div>
    );
  }
}






class BeloteMenu extends React.Component {
  render()  {
    return (
      <div className="box belote">
        <Logo />
        <h2>belote</h2>
      </div>
    );
  }
}

const Logo = () => <div className="logo"><div><a href="/"><img src={logo} alt="logo"/></a></div></div>;

const Button = ({ link, classTitle, text }) => <a href={link}><div className={`button ${classTitle}`}>{text}</div></a>;

const ChoiceButton = ({ classTitle, event, text }) => <button onClick={event} className={`button choice ${classTitle}`}>{text}</button>;

const BackButton = ({ link }) => <a href={link} className="back"><div><i className="fas fa-arrow-circle-left" /> Retour</div></a>;

const InputShareLink = ({ link }) => <div className="shareInput">Inviter <i className="fas fa-share-square" /> <input type="text" value={`http://cards-game-server.herokuapp.com${link}`} disabled/></div>;

const Avatar = ({username}) => (username)? <img alt={`Avatar de ${username}`} src={`https://avatars.dicebear.com/v2/avataaars/${username}.svg?options[mouth][]=twinkle&options[eyes][]=squint&options[background]=%23FFFFFF`} /> : <img className="load" alt="En attente" src={load} />;

function ChoiceFlag({user}){
  if(user.choice === 'king'){
    return <div className="choose">Veut tirer les rois</div>;
  }
  else if(user.choice === 'mate'){
    return <div className="choose">Veut chosir</div>;
  } else {
    return "";
  }
}

export default App;
