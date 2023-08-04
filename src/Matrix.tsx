import { Component, createPortal, createRef, RefObject } from "inferno";
import { createClient, MatrixCall, Room, ClientEvent } from "matrix-js-sdk";
import * as localforage from "localforage";

import { TabView, TextListItem, SoftKey, DropDownMenu } from "KaiUI";
import DMsView from "./DMsView";
import RoomsView from "./RoomsView";
import About from "./About";
import Waiting from "./Waiting";
import RoomView from "./RoomView";
import CallScreen from "./CallScreen";
import Settings from "./Settings";
import InvitesView from "./InvitesView";
import {
  urlBase64ToUint8Array,
  toast,
  getInvite,
  getRoomsByPredicate,
} from "./utils";
import shared from "./shared";
import { RoomsViewState } from "./types";
import { CallEventHandlerEvent } from "matrix-js-sdk/lib/webrtc/callEventHandler";
import { CallEvent } from "matrix-js-sdk/lib/webrtc/call";

const vapidPublicKey =
  "BJ1E-DznkVbMLGoBxRw1dZWQnRKCaS4K8KaOKbijeBeu4FaVMB00L_WYd6yx91SNVNhKKT8f0DEZ9lqNs50OhFs";

interface MatrixProps {
  data: any;
}

interface Call {
  type: string;
  userId?: string;
  roomId?: string;
}

interface MatrixState {
  currentTab: number;
  call: Call | null;
  syncDone: boolean;
  openRoomId: string;
  optionsMenu: boolean;
}

function getNumberOfInvites(): number {
  return getRoomsByPredicate(getInvite).length;
}

class Matrix extends Component<MatrixProps, MatrixState> {
  private readonly tabs: string[];
  private roomId: string;
  private call: MatrixCall | null;
  private roomsViewRef: RefObject<RoomsView>;
  private invitesViewRef: RefObject<InvitesView>;
  private invite: Room | null;
  public state: MatrixState;

  pushNotification = (device_id: string) => {
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
          shared.mClient.setPusher({
            app_display_name: "chooj",
            app_id: "net.bananahackers.chooj",
            pushkey: pushkey,
            kind: "http",
            lang: "en",
            device_display_name: "KaiOS chooj " + device_id,
            data: {
              url: "https://farooqkz.de1.hashbang.sh/_matrix/push/v1/notify",
            },
          });
          console.log("Pusher set");
        });
    });
  };

  joinRoom = (roomId: string, callback?: () => void) => {
    toast("Joining", 1000);
    shared.mClient
      .joinRoom(roomId)
      .then((room: Room) => {
        shared.mClient.once(ClientEvent.Sync, () => {
          if (this.roomsViewRef) {
            this.roomsViewRef.current?.setState((state: RoomsViewState) => {
              state.rooms.push(room);
              return state;
            });
          } else {
            let roomsViewState: RoomsViewState | undefined =
              shared.stateStores.get("RoomsView");
            if (roomsViewState) {
              roomsViewState.rooms.push(room);
            } else {
              roomsViewState = { rooms: [room], cursor: 0 };
            }
            shared.stateStores.set("RoomsView", roomsViewState);
          }
          toast("Joined", 1750);
          callback && callback();
        });
      })
      .catch((e) => {
        window.alert("Some error occured during joining:" + e);
        console.log(e);
      });
  };

  onTabChange = (index: number) => {
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
        return this.invite ? "Accept" : "";
      case "Settings":
        return "";
      default:
        return "";
    }
  };

  softRightText = () => {
    switch (this.tabs[this.state.currentTab]) {
      case "About":
        return "Repo.";
      case "People":
        return "Options";
      case "Rooms":
        return "Options";
      case "Invites":
        return this.invite ? "Reject" : "";
      case "Settings":
        return "Log out";
      default:
        return "";
    }
  };

  softCenterText = () => {
    switch (this.tabs[this.state.currentTab]) {
      case "About":
        return "";
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

  startCall = (roomId: string, type: string, userId: string) => {
    this.setState({
      call: { type: type, roomId: roomId, userId: userId },
    });
  };

  softRightCb = () => {
    let menu: HTMLElement | null = document.querySelector("#menu");
    if (!menu || (menu && menu.innerHTML)) return;
    if (this.softRightText() === "Options") {
      this.setState({ optionsMenu: true });
      document.addEventListener("keydown", this.onKeyDown);
    }
    if (this.softRightText() === "Log out") {
      shared.mClient.logout(true).then(() => {
        localforage
          .removeItem("login")
          .then(() => {
            window.alert("Logged out");
            window.location = window.location; // eslint-disable-line no-self-assign
          })
          .catch((e) => {
            console.log("REPORT", e);
          });
      });
    }
    if (this.softRightText() === "Repo.") {
      window.open("https://github.com/farooqkz/chooj", "_blank");
    }
    if (this.softRightText() === "Reject" && this.invite) {
      toast("Rejecting", 1000);
      shared.mClient.leave(this.invite.roomId).then(() => {
        if (this.invitesViewRef.current) {
          this.invitesViewRef.current.invites =
            this.invitesViewRef.current.invites.filter((room: Room) =>
              this.invite ? room.roomId !== this.invite.roomId : true
            );
          if (this.invitesViewRef.current.invites.length === 0) {
            this.invite = null;
          }
          this.invitesViewRef.current.forceUpdate();
          toast("Rejected", 1000);
        }
      });
    }
  };

  softLeftCb = () => {
    let menu: HTMLElement | null = document.querySelector("#menu");
    if (!menu || (menu && menu.innerHTML)) return;
    if (this.softLeftText() === "Join") {
      let roomAlias = window.prompt("Enter room name or Id");
      if (!roomAlias) {
        return;
      }
      this.joinRoom(roomAlias);
    }
    if (this.softLeftText() === "Accept" && this.invite) {
      this.joinRoom(this.invite.roomId, () => {
        if (this.invitesViewRef.current) {
          this.invitesViewRef.current.invites =
            this.invitesViewRef.current.invites.filter((room: Room) =>
              this.invite ? room.roomId !== this.invite.roomId : true
            );
          if (this.invitesViewRef.current.invites.length === 0) {
            this.invite = null;
          }
          this.invitesViewRef.current.forceUpdate();
        }
      });
    }
  };

  softCenterCb = () => {
    let menu: HTMLElement | null = document.querySelector("#menu");
    if (!menu || (menu && menu.innerHTML)) return;
    switch (this.tabs[this.state.currentTab]) {
      case "About":
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

  onKeyDown = (evt: KeyboardEvent) => {
    if (evt.key === "Backspace" || evt.key === "b") {
      if (this.state.optionsMenu) {
        evt.preventDefault();
        this.setState({ optionsMenu: false });
        document.removeEventListener("keydown", this.onKeyDown);
      }
    }
  };

  optionsSelectCb = (item: string) => {
    if (item === "leave") {
      // leave
      const roomToLeave = shared.mClient.getRoom(this.roomId);
      if (!roomToLeave) {
        alert("Error: no room selected");
      } else if (
        window.confirm(`Are you sure to leave '${roomToLeave.name}'?`)
      ) {
        shared.mClient.leave(this.roomId).then(() => {
          this.roomsViewRef?.current?.setState((state: RoomsViewState) => {
            state.rooms = state.rooms.filter(
              (room) => room.roomId != this.roomId
            );
            return state;
          });
          toast("Left the room", 1500);
        });
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

  constructor(props: any) {
    super(props);
    console.log("LOGIN DATA", props.data);
    shared.mClient = createClient({
      userId: props.data.user_id,
      accessToken: props.data.access_token,
      deviceId: props.data.device_id,
      baseUrl: props.data.well_known["m.homeserver"].base_url,
      identityServer:
        props.data.well_known["m.identity_server"] &&
        props.data.well_known["m.identity_server"].base_url,
      //      store: new matrixcs.IndexedDBStore({ indexedDB: window.indexedDB, localStorage: window.localStorage }),
    });
    const client = shared.mClient;
    client.on(CallEventHandlerEvent.Incoming, (call: MatrixCall) => {
      if (this.state.call) {
        call.once(CallEvent.State, (state: string) => {
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
    client.once(ClientEvent.Sync, () => {
      this.setState({ syncDone: true });
    });
    client.startClient({ lazyLoadMembers: true });
    this.tabs = ["People", "Rooms", "Invites", "Settings", "About"];
    this.roomId = "";
    this.invite = null;
    this.call = null;
    this.roomsViewRef = createRef();
    this.invitesViewRef = createRef();
    this.state = {
      currentTab: 0,
      call: null,
      syncDone: false,
      openRoomId: "",
      optionsMenu: false,
    };
    console.log("MATRIX", this);
    console.log("Shared", shared);
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
    if (call && this.call) {
      return (
        <CallScreen
          callProps={call}
          endOfCallCb={() => {
            this.call = null;
            this.setState({ call: null });
          }}
          call={this.call}
        />
      );
    }

    let numberOfInvites: number = getNumberOfInvites();
    let tabLabels: string[] = Array.from(this.tabs);
    if (numberOfInvites !== 0) {
      tabLabels[2] += ` (${numberOfInvites})`;
      // Remember that tabs[2] is "Invites"
    }

    if (openRoomId === "") {
      return (
        <>
          <TabView
            tabLabels={tabLabels}
            onChangeIndex={this.onTabChange}
            defaultActiveTab={currentTab}
          >
            <DMsView
              startCall={this.startCall}
              selectedRoomCb={(roomId) => {
                this.roomId = roomId || "";
              }}
            />
            <RoomsView
              selectedRoomCb={(roomId) => {
                this.roomId = roomId || "";
              }}
              ref={this.roomsViewRef}
            />
            <InvitesView
              selectedInviteCb={(invite: Room | null) => {
                this.invite = invite;
              }}
              ref={this.invitesViewRef}
            />
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
                <DropDownMenu
                  title="Options"
                  selectCb={this.optionsSelectCb}
                  labels={["leave"]}
                >
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
