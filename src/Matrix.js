import { Component } from "inferno";
import * as matrixcs from "matrix-js-sdk";

import TabView from "./TabView";
import SoftKey from "./ui/SoftKey";
import DMsView from "./DMsView";
import RoomsView from "./RoomsView";
import About from "./About";
import Waiting from "./Waiting";
import RoomView from "./RoomView";
import InvitesView from "./InvitesView";

class Matrix extends Component {
  onTabChange = (index) => {
    this.setState({ currentTab: index });
  };

  softLeftText = () => {
    switch (this.tabs[this.state.currentTab]) {
      case "About":
        return "";
      case "People":
        return "";
      case "Rooms":
        return "";
      case "Invites":
        return "Accept";
      case "Settings":
        return "";
      default:
        return "";
    }
  };

  softRightText = () => {
    switch (this.tabs[this.state.currentTab]) {
      case "About":
        return "";
      case "People":
        return "";
      case "Rooms":
        return "";
      case "Invites":
        return "Decline";
      case "Settings":
        return "";
      default:
        return "";
    }
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

  softRightCb = () => {};

  softLeftCb = () => {};

  softCenterCb = () => {
    if (document.querySelector("#menu").innerHTML) return;
    switch (this.tabs[this.state.currentTab]) {
      case "About":
        window.open("https://github.com/farooqkz/chooj", "_blank");
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
    this.invite = null;
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
            <InvitesView
              selectedInviteCb={(invite) => {
                this.invite = invite;
              }}
            />
            <p>{"Settings not implemented"}</p>
            <About />
          </TabView>
          <footer $HasVNodeChildren>
            <SoftKey
              leftText={this.softLeftText()}
              leftCb={this.softLeftCb}
              rightText={this.softRightText()}
              rightCb={this.softRightCb}
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
