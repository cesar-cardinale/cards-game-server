import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {BrowserRouter, Switch, Route} from "react-router-dom";
import Menu from './Menu';
import {ContreeMenu, ContreeStart, ContreeUsername, ContreePlay} from './Contree';

const routing = (
  <BrowserRouter>
    <Switch>
      <Route path="/" exact component={Menu}/>
      <Route path="/Contree" exact component={ContreeMenu}/>
      <Route path="/Contree/Start" exact component={ContreeStart}/>
      <Route path="/Contree/Join/:ident" exact component={ContreeUsername}/>
      <Route path="/Contree/Play/:ident" exact component={ContreePlay}/>
    </Switch>
  </BrowserRouter>
)

ReactDOM.render(routing, document.getElementById('root'));

serviceWorker.unregister();
