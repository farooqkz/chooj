import { Component } from "inferno";
import * as matrixcs from "matrix-js-sdk";
import * as localforage from "localforage";

import DeviceName from "./DeviceName";

class Setup extends Component {
  constructor(props) {
    super(props);
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
    client.startClient({ lazyLoadMembers: true });
    client.setDeviceDetails(client.getDeviceId(), { display_name: DeviceName });
    localforage.setItem("setuped", true);
    // eslint-disable-next-line no-self-assign
    window.location=window.location;
  }
}

export default Setup; 
