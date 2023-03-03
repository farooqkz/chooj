import { Component, createPortal } from "inferno";
import * as matrixcs from "matrix-js-sdk";
import * as localforage from "localforage";
import { MatrixClient } from "matrix-js-sdk";

import TabView from "./TabView";
import SoftKey from "./ui/SoftKey";
import DMsView from "./DMsView";
import RoomsView from "./RoomsView";
import About from "./About";
import Waiting from "./Waiting";
import RoomView from "./RoomView";
import CallScreen from "./CallScreen";
import Settings from "./Settings";
import DropDownMenu from "./DropDownMenu";
import TextListItem from "./ui/TextListItem";
import { urlBase64ToUint8Array, toast, updateState } from "./utils";

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
    if (!this.state.optionsMenu) this.setState({ currentTab: index });
  };

  softLeftText = () => {
    switch (this.tabs[this.state.currentTab]) {
      case "About":
        return "";
      case "People":
        return "";
      case "Rooms":
        return "Join";
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
        return "Options";
      case "Rooms":
        return "Options";
      case "Invites":
        return "";
      case "Settings":
        return "Log out";
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

  softRightCb = () => {
    if (document.querySelector("#menu").innerHTML) return;
    if (this.softRightText() === "Toast") {
      toast("Hello", 1000);
      return;
    }
    if (this.softRightText() === "Options") {
      this.setState({ optionsMenu: true });
      document.addEventListener("keydown", this.onKeyDown);
    }
    if (this.softRightText() === "Log out") {
      window.mClient.logout(true).then(() => {
        localforage.removeItem("login", null).then(() => {
          window.alert("Logged out");
          window.location = window.location; // eslint-disable-line no-self-assign
        }).catch((e) => {
          console.log("REPORT", e);
        });
      });
    }
  };

  softLeftCb = () => {
    if (document.querySelector("#menu").innerHTML) return;
    if (this.softLeftText() === "Join") {
      let roomAlias = window.prompt("Enter room name or Id");
      if (!roomAlias) {
        return;
      }
      toast("Joining", 1000);
      window.mClient
        .joinRoom(roomAlias)
        .then((room) => {
          // syncing must be done and the joined room must be immediately opened
          // however matrix-js-sdk v23.0.0 currently does not support it,
          window.mClient.syncApi
            .sync()
            .then(() =>
              this.roomsViewRef.setState((state) =>
                updateState(room, state, false)
              )
            )
            .then(() => toast("Joined", 1750));
        })
        .catch((e) => {
          window.alert("Some error occured during joining:" + e);
          console.log(e);
        });
    }
  };

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

  onKeyDown = (evt) => {
    if (evt.key === "Backspace" || evt.key === "b") {
      if (this.state.optionsMenu) {
        evt.preventDefault();
        this.setState({ optionsMenu: false });
        document.removeEventListener("keydown", this.onKeyDown);
      }
    }
  };

  optionsSelectCb = (item) => {
    /** @type {MatrixClient} */
    const matrix = window.mClient
    if (item === 0) {
      // leave
      const room = matrix.getRoom(this.roomId)
      if (!room) {
        alert("Error: no room selected")
      }
      if (confirm(`Are you sure to leave '${room.name}'?`)) {
        matrix.leave(room.roomId)
      }
    }
    // forget is currently not nessary, leaving already removes the room from the list
    // else if (item===1) {
    //  // forget
    //  const room = matrix.getRoom(this.roomId)
    //   if(!room) {
    //     alert("Error: no room selected")
    //   }
    //   matrix.forget(room.roomId)
    // }
    this.setState({ optionsMenu: false });
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
    this.roomsViewRef = null;
    this.state = {
      currentTab: 0,
      call: null,
      syncDone: false,
      openRoomId: "",
      optionsMenu: false,
    };
  }

  render() {
    const { currentTab, call, syncDone, openRoomId, optionsMenu } = this.state;
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
              ref={(r) => {
                this.roomsViewRef = r;
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
          {optionsMenu
            ? createPortal(
              <DropDownMenu title="Options" selectCb={this.optionsSelectCb}>
                <TextListItem primary="Leave" />
                {/* forget is currently not nessary, leaving already removes the room from the list */}
                {/* <TextListItem primary="Forget Room" /> */}
              </DropDownMenu>,
              document.querySelector("#menu")
            )
            : null}
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
