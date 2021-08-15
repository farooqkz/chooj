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
    };
    localforage.getItem("login").then((login) => {
      if (login) {
        this.loginData = login;
        this.setState({ state: "matrix" });
      } else {
        this.setState({ state: "login" });
      }
    });
  }

  render() {
    if (this.state.state === null) {
      return <Waiting />;
    }

    if (this.state.state === "login") {
      return <Login />;
    }

    if (this.state.state === "matrix") {
      return <Matrix data={this.loginData} />;
    }
  }
}

export default App;
