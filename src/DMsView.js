import { Component, createPortal } from "inferno";
import * as matrixcs from "matrix-js-sdk";

import ListView from "./ListView";
import personIcon from "./person_icon.png";
import ChatDMItem from "./ChatDMItem";
import TextListItem from "./ui/TextListItem";
import DropDownMenu from "./DropDownMenu";
import { makeHumanReadableEvent } from "./utils";

const AVATAR_WIDTH = 36;
const AVATAR_HEIGHT = 36;

function CallSelectionMenu({ selectCb }) {
  return (
    <DropDownMenu
      title="Start call"
      selectCb={(cursor) => selectCb(["voice", "video"][cursor])}
    >
      <TextListItem primary="Voice call" />
      <TextListItem primary="Video call" />
    </DropDownMenu>
  );
}

class DMsView extends Component {
  handleKeyDown = (evt) => {
    const { showCallSelection, inCall } = this.state;
    if (evt.key === "Call" || evt.key === "c") {
      if (this.rooms.length === 0) {
        window.alert("You're lonely(no DM)... there is no one to call!");
        return;
      }
      this.setState({ showCallSelection: true });
    }

    if (evt.key === "b" || evt.key === "Backspace") {
      if (showCallSelection) {
        this.setState({ showCallSelection: false });
        evt.preventDefault();
      }
      if (inCall !== "") {
        evt.preventDefault();
        this.call.hangup();
      }
    }
  };

  startCall = (type) => {
    this.setState({ showCallSelection: false });
    if (type !== "voice") {
      alert("Not implemented");
      return;
    }
    const cursor = this.state.cursor;
    const roomId = this.rooms[cursor].roomId;
    const userId = this.rooms[cursor].userId;
    this.props.startCall(roomId, type, userId);
  };

  cursorChangeCb = (cursor) => {
    if (!this.state.showCallSelection) {
      if (this.rooms.length !== 0) {
        this.props.selectedRoomCb(this.rooms[cursor].roomId);
      } else {
        this.props.selectedRoomCb(null);
      }
      this.setState({ cursor: cursor });
    }
  };

  getDMs = (room) =>
    room.getJoinedMemberCount() === 2 && room.getMyMembership() === "join";

  constructor(props) {
    super(props);
    this.rooms = [];
    this.state = window.stateStores.get("DMsView") || {
      cursor: 0,
      showCallSelection: false,
    };
  }

  componentWillMount() {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
    window.stateStores.set("DMsView", this.state);
  }

  render() {
    const client = window.mClient;
    const { cursor, showCallSelection } = this.state;
    this.rooms = client
      .getVisibleRooms()
      .filter(this.getDMs)
      .map((room) => {
        let roomEvents = room.getLiveTimeline().getEvents();
        let lastEvent = roomEvents[roomEvents.length - 1];
        const lastEventTime = lastEvent.getTs();
        const lastEventContent = lastEvent.getContent();
        const lastEventType = lastEvent.getType();
        const lastEventSender = lastEvent.getSender();
        const theOtherId = room.guessDMUserId();
        const roomId = room.roomId;
        let userObj = client.getUser(theOtherId);
        let mxcUrl = userObj.avatarUrl;
        let avatarUrl;
        if (mxcUrl) {
          avatarUrl = matrixcs.getHttpUriForMxc(
            client.getHomeserverUrl(),
            mxcUrl,
            AVATAR_WIDTH,
            AVATAR_HEIGHT,
            "scale",
            true
          );
        } else {
          avatarUrl = personIcon;
        }
        return {
          roomId: roomId,
          userId: theOtherId,
          avatarUrl: avatarUrl,
          displayName: userObj.displayName,
          lastEvent: makeHumanReadableEvent(
            lastEventType,
            lastEventContent,
            lastEventSender,
            client.getUserId(),
            true
          ),
          lastEventTime: lastEventTime,
        };
      })
      .sort((first, second) => {
        return first.userId > second.userId;
      });
    let renderedRooms = this.rooms.map((room, index) => {
      let item = (
        <ChatDMItem
          userId={room.userId}
          displayName={room.displayName}
          avatar={room.avatarUrl}
          lastEvent={room.lastEvent}
        />
      );
      item.props.isFocused = index === cursor;
      return item;
    });

    if (renderedRooms.length === 0) {
      renderedRooms.push(<TextListItem primary="No DM :(" isFocused />);
    }
    if (showCallSelection)
      return (
        <>
          <ListView cursor={cursor} cursorChangeCb={this.cursorChangeCb}>
            {renderedRooms}
          </ListView>
          {createPortal(
            <CallSelectionMenu selectCb={this.startCall} />,
            document.getElementById("menu")
          )}
        </>
      );
    return (
      <ListView cursor={cursor} cursorChangeCb={this.cursorChangeCb}>
        {renderedRooms}
      </ListView>
    );
  }
}

export default DMsView;
