import { Component } from "inferno";
import "./App.css";
import Waiting from "./Waiting";
import * as localforage from "localforage";
import Matrix from "./Matrix";
import Login from "./Login";
import { LoginData } from "./types";

interface AppState {
  state: string | null;
  online: boolean | null;
}

class App extends Component<{}, AppState> {
  private loginData: null | LoginData;
  private timeout: null | number;
  constructor(props: {}) {
    super(props);
    this.loginData = null;
    this.timeout = null;
    this.state = {
      state: null,
      online: navigator.onLine ? null : false,
    };
    localforage.getItem("login").then((login: unknown) => {
      if (login) {
        this.loginData = login as LoginData;
        this.setState({ state: "matrix" });
      } else {
        this.setState({ state: "login" });
      }
    });
    if (this.state.online === null) {
      let xhr = new XMLHttpRequest({ mozSystem: true });
      xhr.open("HEAD", "https://example.com");
      this.timeout = setTimeout(() => this.setState({ online: false }), 5000);
      xhr.onload = () => this.timeout && clearTimeout(this.timeout) || this.setState({ online: true });
      xhr.send();
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
