import { Component } from "inferno";
import * as matrixcs from "matrix-js-sdk";

import TabView from "./TabView";
import SoftKey from "./ui/SoftKey";
import DMsView from "./DMsView";
import RoomsView from "./RoomsView";
import About from "./About";
import Waiting from "./Waiting";
import RoomView from "./RoomView";

class Matrix extends Component {
  onTabChange = (index) => {
    this.setState({ currentTab: index });
  };

  softCenterText = () => {
    switch (this.tabs[this.state.currentTab]) {
      case "About":
        return "Repo.";
      case "People":
        return "Open";
      case "Rooms":
        return "Open";
      case "Invites":
        return "";
      case "Settings":
        return "";
      default:
        return "";
    }
  };

  openRoom = () => {
    this.setState({ openRoomId: this.roomId });
  };

  softCenterCb = () => {
    if (document.querySelector("#menu").innerHTML) return;
    switch (this.tabs[this.state.currentTab]) {
      case "About":
        window.open("https://github.com/farooqkz/matrix-client", "_blank");
        break;
      case "People":
      case "Rooms":
        this.openRoom();
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
    client.once("sync", (state, prevState, res) => {
      this.setState({ syncDone: true });
    });
    client.startClient({ lazyLoadMembers: true });
    this.tabs = ["People", "Rooms", "Invites", "Settings", "About"];
    this.roomId = "";
    this.state = {
      currentTab: 0,
      isCall: false,
      syncDone: false,
      openRoomId: "",
    };
  }

  render() {
    if (!this.state.syncDone) {
      return (
        <>
          <Waiting />
        </>
      );
    } else if (this.state.openRoomId === "") {
      return (
        <>
          <TabView tabLabels={this.tabs} onChangeIndex={this.onTabChange}>
            <DMsView
              setCall={(isCall) => this.setState({ isCall: isCall })}
              selectedRoomCb={(roomId) => {
                this.roomId = roomId;
              }}
            />
            <RoomsView
              selectedRoomCb={(roomId) => {
                this.roomId = roomId;
              }}
            />
            <p>{"Invites are not implemented and auto accepted"}</p>
            <p>{"Settings not implemented"}</p>
            <About />
          </TabView>
          <footer $HasVNodeChildren>
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
    } else {
      return (
        <RoomView
          roomId={this.state.openRoomId}
          closeRoomView={() => this.setState({ openRoomId: "" })}
        />
      );
    }
  }
}

export default Matrix;
