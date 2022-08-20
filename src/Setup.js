import { Component } from "inferno";
import * as matrixcs from "matrix-js-sdk";
import * as localforage from "localforage";

import DeviceName from "./DeviceName";
import SoftKey from "./ui/SoftKey";
import Header from "./ui/Header";

class Setup extends Component {

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
    });
    client.startClient({ lazyLoadMembers: true });
    client.setDeviceDetails(client.getDeviceId(), { display_name: DeviceName });
    client.once("sync", (state, prevState, res) => {
      localforage.setItem("setuped", true);
      self.refresh();
    });
  }

  refresh() {
    // eslint-disable-next-line no-self-assign
    window.location=window.location;
  }

  render() {
    return (
      <div>
        <Header text="Setup..." />
        <footer>
          <SoftKey
            leftText="Abort"
            leftCb={() => window.close()}
            rightText="Skip"
            rightCb={() => this.refresh()}
          />
        </footer>
      </div>
    );
  }
}

export default Setup; 
