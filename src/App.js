import { Component } from "inferno";
import "./App.css";
import Waiting from "./Waiting";
import * as localforage from "localforage";
import Matrix from "./Matrix";
import Setup from "./Setup";
import Login from "./Login";

class App extends Component {
  constructor(props) {
    super(props);
    this.loginData = null;
    this.state = {
      state: null,
    };
    localforage.getItem("login").then((login) => {
      if (login) {
        this.loginData = login;
        localforage.getItem("setuped").then((setuped) => {
          if (setuped) {
            this.setState({ state: "matrix" });
          } else {
            this.setState({ state: "setup" });
          }
        }
      } else {
        this.setState({ state: "login" });
      }
    });
  }

  render() {
    const { state } = this.state;
    if (state === null) {
      return <Waiting noTip />;
    }

    if (state === "login") {
      return <Login />;
    }

    if (state === "setup") {
      return <Setup data={this.loginData} />;
    }

    if (state === "matrix") {
      return <Matrix data={this.loginData} />;
    }
  }
}

export default App;
