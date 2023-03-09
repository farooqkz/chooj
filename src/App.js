import { Component } from "inferno";
import "./App.css";
import Waiting from "./Waiting";
import * as localforage from "localforage";
import Matrix from "./Matrix";
import Login from "./Login";

class App extends Component {
  constructor(props) {
    super(props);
    this.loginData = null;
    this.state = {
      state: null,
      online: navigator.onLine ? null : false,
    };
    localforage.getItem("login").then((login) => {
      if (login) {
        this.loginData = login;
        this.setState({ state: "matrix" });
      } else {
        this.setState({ state: "login" });
      }
    });
    if (this.state.online === null) {
      let xhr = new XMLHttpRequest({ mozSystem: true });
      xhr.open("HEAD", "https://example.com");
      xhr.onload = () => this.setState({ online: true });
      xhr.send();
      setTimeout(() => this.setState((prevState) => {
        prevState.online = Boolean(prevState.online);
        return prevState;
      }), 5000);
    }
  }

  render() {
    const { state, online } = this.state;
    if (online === false) {
      window.alert("You don't seem to have a working Internet connection. chooj will close now.");
      window.close();
    }

    if (state === null || online === null) {
      return <Waiting noTip />;
    }

    if (state === "login") {
      return <Login />;
    }

    if (state === "matrix") {
      return <Matrix data={this.loginData} />;
    }
  }
}

export default App;
