import { Component } from "inferno";
import * as matrixcs from "matrix-js-sdk";

import TabView from "./TabView";
import SoftKey from "./ui/SoftKey";
import DMsView from "./DMsView";
import About from "./About";
import Waiting from "./Waiting";

class Matrix extends Component {
  onTabChange = (index) => {
    this.setState({ currentTab: index });
  };

  softCenterText = () => {
    switch (this.tabs[this.state.currentTab]) {
      case "About":
        return "Repo.";
      case "People":
        return "";
      case "Rooms":
        return "";
      case "Invites":
        return "";
      case "Settings":
        return "";
      default:
        return "";
    }
  };

  softCenterCb = () => {
    if (document.querySelector("#menu").innerHTML) return;
    switch (this.tabs[this.state.currentTab]) {
      case "About":
        window.open("https://github.com/farooqkz/matrix-client", "_blank");
        break;
      default:
        break;
    }
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
        client
          .joinRoom(member.roomId)
          .then(() => alert(`Auto joined ${member.name} after invite`));
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
    client.on("sync", (state, prevState, res) => {
      this.setState({ syncDone: true });
    });
    client.startClient({ initialSyncLimit: 3, lazyLoadMembers: true });
    this.tabs = ["People", "Rooms", "Invites", "Settings", "About"];
    this.state = {
      currentTab: 0,
      isCall: false,
      syncDone: false,
    };
  }

  render() {
    if (!this.state.syncDone) {
      return (
        <>
          <Waiting />
        </>
      );
    } else {
      return (
        <>
          <TabView tabLabels={this.tabs} onChangeIndex={this.onTabChange}>
            <DMsView setCall={(isCall) => this.setState({ isCall: isCall })} />
            <p>{"Rooms not implemented"}</p>
            <p>{"Invites are not implemented and auto accepted"}</p>
            <p>{"Settings not implemented"}</p>
            <About />
          </TabView>
          <footer HasVNodeChildren>
            <SoftKey
              leftText="Quit"
              leftCb={() => {
                if (window.confirm("Quit?")) window.close();
              }}
              centerText={this.softCenterText()}
              centerCb={this.softCenterCb}
            />
          </footer>
        </>
      );
    }
  }
}

export default Matrix;
