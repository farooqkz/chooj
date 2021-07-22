import { Component } from "inferno";
import * as matrixcs from "matrix-js-sdk";

import TabView from "./TabView";
import SoftKey from "./ui/SoftKey";
import DMsView from "./DMsView";

class Matrix extends Component {
  onTabChange = (index) => {
    this.setState({ currentTab: index });
  };

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
    client.on("RoomMember.membership", (event, member) => {
      const myId = client.getUserId();
      if (member.membership === "invite" && member.userId === myId) {
        client.joinRoom(member.roomId).then(() => 
          alert(`Auto joined ${member.name} after invite`));
      }
    });
    client.on("Call.incoming", (call) => {
      call.once("state", (state) => {
        if (this.state.isCall) {
          // reject this call if there's already
          // a call going 
          call.reject();
        } else {
          this.call = call;
          this.setState({ isCall: true });
        }
      });
    });
    client.startClient({ initialSyncLimit: 3, lazyLoadMembers: true });
    this.tabs = ["People", "Rooms", "Invites", "Settings", "About"];
    this.state = {
      currentTab: 0,
      isCall: false
    };
  }

  render() {
    return (
      <>
        <TabView tabLabels={this.tabs} onChangeIndex={this.onTabChange}>
          <DMsView rooms={this.dmRooms} />
          <p>{"Rooms not implemented"}</p>
          <p>{"Invites are not implemented and auto accepted"}</p>
          <p>{"Settings not implemented"}</p>
          <p>{"About info coming soon..."}</p>
        </TabView>
      <footer $HasVNodeChildren>
        <SoftKey
          leftText="Quit"
          leftCb={() => {
            if (window.confirm("Quit?")) window.close();
          }}
        />
      </footer>
      </>
    );
  }
}

export default Matrix;
