import { Component } from "inferno";
import * as matrixcs from "matrix-js-sdk";
import * as localforage from "localforage";

import DeviceName from "./DeviceName";
import SoftKey from "./ui/SoftKey";
import Header from "./ui/Header";

class Setup extends Component {

  cursorChangeCb = (cursor) => {
    this.setState({ cursor: cursor });
  };

  handleKeyDown = (evt) => {
    if (evt.key === "Backspace" || evt.key === "b") {
      evt.preventDefault();
      if (this.state.loginWithQR) {
        this.setState({ loginWithQR: false });
        return;
      }
      if (this.state.stage <= 0) {
        if (window.confirm("Quit?")) {
          window.close();
        } else {
          this.setState({ stage: 0 });
        }
        return;
      }
      this.setState((prevState) => {
        prevState.cursor = 0;
        prevState.stage--;
      });
    }
    if (evt.key === "c" || evt.key === "Call") {
      if (this.state.stage !== 0) return;
      if (this.state.cursor !== 3) return;
      this.setState({ loginWithQR: true });
    }
  };

  constructor(props) {
    super(props);
    console.log("LOGIN DATA", props.data);
    window.mClient = matrixcs.createClient({
      userId: props.data.user_id,
      accessToken: props.data.access_token,
      deviceId: props.data.device_id,
      baseUrl: props.data.well_known["m.homeserver"].base_url,
      identityServer:
        props.data.well_known["m.identity_server"] &&
        props.data.well_known["m.identity_server"].base_url,
    });
    const client = window.mClient;
    client.once("sync", (state, prevState, res) => {
      this.setState({ syncDone: true });
    });
    client.startClient({ lazyLoadMembers: true });
    client.setDeviceDetails(client.getDeviceId(), { display_name: DeviceName });
    client.once("sync", (state, prevState, res) => {
      this.setState({ syncDone: true });
    });
    localforage.setItem("setuped", true);
    // eslint-disable-next-line no-self-assign
    //window.location=window.location;
  }

  refresh() {
    // eslint-disable-next-line no-self-assign
    window.location=window.location;
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }


  render() {
    return (
      <div>
        <Header text="Setup..." />
        <footer>
          <SoftKey
            leftText="Abort"
            leftCb={() => window.close()}
            centerCb={() => window.close()}
            centerText={"Abort"}
            rightText="Next"
            rightCb={this.refresh()}
          />
        </footer>
      </div>
    );
  }
}

export default Setup; 
