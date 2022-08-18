import { Component } from "inferno";
import * as matrixcs from "matrix-js-sdk";

import TabView from "./TabView";
import SoftKey from "./ui/SoftKey";
import DMsView from "./DMsView";
import RoomsView from "./RoomsView";
import About from "./About";
import Waiting from "./Waiting";
import RoomView from "./RoomView";
import CallScreen from "./CallScreen";
import Settings from "./Settings";
import { urlBase64ToUint8Array } from "./utils";
#import DeviceName from "./DeviceName";

const vapidPublicKey =
  "BJ1E-DznkVbMLGoBxRw1dZWQnRKCaS4K8KaOKbijeBeu4FaVMB00L_WYd6yx91SNVNhKKT8f0DEZ9lqNs50OhFs";

class Matrix extends Component {
  pushNotification = (device_id) => {
    if (!window.navigator.serviceWorker) return;
    if (!window.PushManager) return;
    window.navigator.serviceWorker.register("/sw.js").then((swReg) => {
      swReg.pushManager
        .getSubscription()
        .then((sub) => {
          if (!sub) {
            return swReg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
            });
          } else {
            return Promise.resolve(sub);
          }
        })
        .then((sub) => {
          let pushkey = JSON.stringify(sub.toJSON());
          window.mClient.setPusher({
            app_display_name: "Chooj",
            app_id: "net.bananahackers.chooj",
            pushkey: pushkey,
            kind: "http",
            lang: "en",
            device_display_name: "KaiOS " + device_id,
            data: {
              url: "https://farooqkz.de1.hashbang.sh/_matrix/push/v1/notify",
            },
          });
          console.log("Pusher set");
        });
    });
  };

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
        return "";
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
        return "";
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
        return "Push";
      default:
        return "";
    }
  };

  openRoom = () => {
    this.setState({ openRoomId: this.roomId });
  };

  startCall = (roomId, type, userId) => {
    this.setState({
      call: { type: type, roomId: roomId, displayName: userId },
    });
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
      case "Settings":
        if (window.confirm("Are you sure? cannot be undone"))
          this.pushNotification(this.props.data.device_id);
        break;
      default:
        break;
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
    client.setDisplayName("Chooj (KaiOS)");
    client.on("Call.incoming", (call) => {
      if (this.state.call) {
        call.once("state", (state) => {
          if (state === "ringing") {
            call.reject();
          }
        });
      } else {
        this.call = call;
        this.setState({
          call: { type: "incoming" },
        });
      }
    });
    client.once("sync", (state, prevState, res) => {
      this.setState({ syncDone: true });
    });
    client.startClient({ lazyLoadMembers: true });
    this.tabs = ["People", "Rooms", "Invites", "Settings", "About"];
    this.roomId = "";
    this.invite = null;
    this.call = null;
    this.state = {
      currentTab: 0,
      call: null,
      syncDone: false,
      openRoomId: "",
    };
  }

  render() {
    const { currentTab, call, syncDone, openRoomId } = this.state;
    if (!syncDone) {
      return (
        <>
          <Waiting />
        </>
      );
    }
    if (call) {
      return (
        <CallScreen
          {...call}
          endOfCallCb={() => {
            this.call = null;
            this.setState({ call: null });
          }}
          call={this.call}
        />
      );
    }
    if (openRoomId === "") {
      return (
        <>
          <TabView
            tabLabels={this.tabs}
            onChangeIndex={this.onTabChange}
            defaultActiveTab={currentTab}
          >
            <DMsView
              startCall={this.startCall}
              selectedRoomCb={(roomId) => {
                this.roomId = roomId;
              }}
            />
            <RoomsView
              selectedRoomCb={(roomId) => {
                this.roomId = roomId;
              }}
            />
            <p>Invites are not implemented</p>
            <Settings />
            <About />
          </TabView>
          <footer>
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
    }
    return (
      <RoomView
        roomId={openRoomId}
        closeRoomView={() => this.setState({ openRoomId: "" })}
      />
    );
  }
}

export default Matrix;
