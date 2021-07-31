import { Component, createPortal } from "inferno";
import * as matrixcs from "matrix-js-sdk";

import ListView from "./ListView";
import personIcon from "./person_icon.png";
import ChatDMItem from "./ChatDMItem";
import TextListItem from "./ui/TextListItem";
import CallScreen from "./CallScreen";
import DropDownMenu from "./DropDownMenu";

const AVATAR_WIDTH = 36;
const AVATAR_HEIGHT = 36;

function CallSelectionMenu(props) {
  return (
    <DropDownMenu
      title="Start call"
      selectCb={(cursor) => props.selectCb(["voice", "video"][cursor])}
    >
      <TextListItem primary="Voice call" />
      <TextListItem primary="Video call" />
    </DropDownMenu>
  );
}

class DMsView extends Component {
  handleKeyDown = (evt) => {
    if (evt.key === "Call" || evt.key === "c") {
      if (this.rooms.length === 0) {
        window.alert("You're lonely... there is no one to call!");
        return;
      }
      this.setState({ showCallSelection: true });
    }

    if (evt.key === "b" || evt.key === "Backspace") {
      if (this.state.showCallSelection) {
        this.setState({ showCallSelection: false });
      }
      if (this.state.inCall !== "") {
        // TODO: this.call.reject()
        this.setState({ inCall: "" });
      }
    }
  };

  startCall = (type) => {
    if (type !== "voice") {
      alert("Not implemented");
      return;
    }
    const roomId = this.rooms[this.state.cursor].roomId;
    this.call = matrixcs.createNewMatrixCall(window.mClient, roomId);
    let audio = new Audio();
    audio.mozAudioChannelType = "telephony";
    this.call.placeVoiceCall();
    this.setState({
      inCall: this.rooms[this.state.cursor].guessDMUserId(),
      showCallSelection: false,
    });
  };

  cursorChangeCb = (cursor) => {
    if (!this.state.showCallSelection) this.setState({ cursor: cursor });
  };

  getDMs = (room) =>
    room.getJoinedMemberCount() === 2 && room.getMyMembership() === "join";
  constructor(props) {
    super(props);
    this.rooms = [];
    this.state = {
      cursor: 0,
      showCallSelection: false,
      inCall: "",
    };
  }

  componentWillMount() {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  render() {
    this.rooms = window.mClient
      .getVisibleRooms()
      .filter(this.getDMs)
      .map((room) => {
        let theOtherId = room.guessDMUserId();
        let mxcUrl = window.mClient.getUser(theOtherId).avatarUrl;
        let avatarUrl;
        if (mxcUrl) {
          avatarUrl = matrixcs.getHttpUriForMxc(
            window.mClient.getHomeserverUrl(),
            mxcUrl,
            AVATAR_WIDTH,
            AVATAR_HEIGHT,
            "scale",
            true
          );
        } else {
          avatarUrl = personIcon;
        }
        return { userId: theOtherId, avatarUrl: avatarUrl };
      })
      .sort((first, second) => {
        return first.userId > second.userId;
      });
    let renderedRooms = this.rooms.map((room, index) => {
      if (index === this.state.cursor)
        return (
          <ChatDMItem userId={room.userId} avatar={room.avatarUrl} isFocused />
        );
      else return <ChatDMItem userId={room.userId} avatar={room.avatarUrl} />;
    });

    if (renderedRooms.length === 0) {
      renderedRooms.push(<TextListItem primary="No DM :(" isFocused />);
    }
    if (this.state.showCallSelection)
      return (
        <>
          <ListView
            cursor={this.state.cursor}
            cursorChangeCb={this.cursorChangeCb}
          >
            {renderedRooms}
          </ListView>
          {createPortal(
            <CallSelectionMenu selectCb={this.startCall} />,
            document.getElementById("menu")
          )}
        </>
      );
    if (this.state.inCall !== "") {
      return (
        <>
          <ListView
            cursor={this.state.cursor}
            cursorChangeCb={this.cursorChangeCb}
          >
            {renderedRooms}
          </ListView>
          {createPortal(
            <CallScreen userId={this.state.inCall} />,
            document.getElementById("callscreen")
          )}
        </>
      );
    }
    return (
      <ListView cursor={this.state.cursor} cursorChangeCb={this.cursorChangeCb}>
        {renderedRooms}
      </ListView>
    );
  }
}

export default DMsView;
