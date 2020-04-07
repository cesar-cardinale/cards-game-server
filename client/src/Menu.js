import React from "react";
import logo from "./assets/img/logo.png";

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

const Logo = () => <div className="logo"><div><a href="/"><img src={logo} alt="logo"/></a></div></div>;

const Button = ({ link, classTitle, text }) => <a href={link}><div className={`button ${classTitle}`}>{text}</div></a>;

export default Menu;
