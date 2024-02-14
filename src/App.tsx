import { Component } from "inferno";
import "./App.css";
import Waiting from "./Waiting";
import * as localforage from "localforage";
import Matrix from "./Matrix";
import Login from "./Login";
import Guide from "./Guide";
import { LoginData, WellKnown } from "./types";

interface AppState {
  state: string | null;
  online: boolean | null;
  guide: boolean | null;
}

class App extends Component<{}, AppState> {
  private loginData: null | LoginData;
  private wellKnown: null | WellKnown;
  private timeout: null | number;
  public state: AppState;

  constructor(props: {}) {
    super(props);
    this.loginData = null;
    this.wellKnown = null;
    this.timeout = null;
    this.state = {
      state: null,
      guide: null,
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
    localforage.getItem("well_known").then((well_known: unknown) => {
      this.wellKnown = well_known as WellKnown;
    });
    localforage.getItem("guide").then((value: unknown) => {
      this.setState({ guide: Boolean(value) });
    });
    if (this.state.online === null) {
      let xhr = new XMLHttpRequest({ mozSystem: true });
      xhr.open("HEAD", "https://example.com");
      this.timeout = setTimeout(() => this.setState({ online: false }), 5000);
      xhr.onload = () =>
        (this.timeout && clearTimeout(this.timeout)) ||
        this.setState({ online: true });
      xhr.send();
    }
  }

  render() {
    const { state, online, guide } = this.state;
    if (online === false) {
      window.alert(
        "You don't seem to have a working Internet connection. chooj will close now."
      );
      window.close();
    }

    if (state === null || online === null || guide === null) {
      return <Waiting noTip />;
    }

    if (state === "login") {
      if (guide) {
        return <Login />;
      } else {
        return (
          <Guide
            endCb={() => {
              this.setState({ guide: true });
              localforage.setItem("guide", true);
            }}
          />
        );
      }
    }

    if (state === "matrix") {
      return <Matrix data={this.loginData} well_known={this.wellKnown} />;
    }
    alert("Some error occured. This must not happen");
    window.close();
    return;
  }
}

export default App;
