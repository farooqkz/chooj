import { Component, createPortal } from "inferno";

import ListView from "./ListView";
import personIcon from "./person_icon.png";
import ChatDMItem from "./ChatDMItem";
import TextListItem from "./ui/TextListItem";
import DropDownMenu from "./DropDownMenu";
import { getAvatarOrDefault, isDM, makeHumanReadableEvent } from "./utils";

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
    const { showCallSelection, rooms } = this.state;
    if (evt.key === "Call" || evt.key === "c") {
      if (rooms.length === 0) {
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
    }
  };

  startCall = (type) => {
    this.setState({ showCallSelection: false });
    if (type !== "voice") {
      alert("Not implemented");
      return;
    }
    const { cursor, rooms } = this.state;
    const roomId = rooms[cursor].roomId;
    const userId = rooms[cursor].userId;
    this.props.startCall(roomId, type, userId);
  };

  cursorChangeCb = (cursor) => {
    if (!this.state.showCallSelection) {
      const rooms = this.state.rooms;
      if (rooms.length !== 0) {
        this.props.selectedRoomCb(rooms[cursor].roomId);
      } else {
        this.props.selectedRoomCb(null);
      }
      this.setState({ cursor: cursor });
    }
  };
  
  handleTimelineUpdate = (evt, room, toStartOfTimeline, removed, data) => {
    if (!room || toStartOfTimeline || !data.liveEvent) {
      return;
    }
    if (!isDM(room)) {
      return;
    }
    this.setState((state) => {
      let isAlreadyOurRoom = false;
      // ^ is <room> a room we already have in this.state.rooms?
      state.rooms = state.rooms.map((ourRoom) => {
        if (room.roomId === ourRoom.roomId) {
          isAlreadyOurRoom = true;
          const lastEvent = room.timeline[room.timeline.length - 1];
          ourRoom.lastEventTime = lastEvent.getTs();
          ourRoom.lastEvent = makeHumanReadableEvent(
            lastEvent.getType(),
            lastEvent.getContent(),
            lastEvent.getSender(),
            window.mClient.getUserId(),
            true
          );
        }
        return ourRoom;
      });
      if (!isAlreadyOurRoom) {
        let lastEvent = room.timeline[room.timeline.length - 1];
        let userId = room.guessDMUserId();
        let userObj = window.mClient.getUser(userId);

        state.rooms.push({
          avatarUrl: getAvatarOrDefault(userObj.avatarUrl, personIcon),
          displayName: userObj.displayName || userId,
          userId: userId,
          roomId: room.roomId,
          lastEvent: makeHumanReadableEvent(
            lastEvent.getType(),
            lastEvent.getContent(),
            lastEvent.getSender(),
            window.mClient.getUserId(),
            true
          ),
          lastEventTime: lastEvent.getTs(),
        });
      }
      return state;
    });
  };

  constructor(props) {
    super(props);
    const client = window.mClient;
    this.state = window.stateStores.get("DMsView") || {
      cursor: 0,
      showCallSelection: false,
      rooms: [],
    };
    if (this.state.rooms.length !== 0) {
      return;
    }
    this.state.rooms = client.getVisibleRooms().filter(isDM).map((room) => {
      let roomEvents = room.getLiveTimeline().getEvents();
      let lastEvent = roomEvents[roomEvents.length - 1];
      const lastEventTime = lastEvent.getTs();
      const lastEventContent = lastEvent.getContent();
      const lastEventType = lastEvent.getType();
      const lastEventSender = lastEvent.getSender();
      const theOtherId = room.guessDMUserId();
      let userObj = client.getUser(theOtherId);
      const avatarUrl = getAvatarOrDefault(userObj.avatarUrl, personIcon);
      return {
        avatarUrl: avatarUrl,
        displayName: userObj.displayName || theOtherId,
        userId: theOtherId,
        roomId: room.roomId,
        lastEvent: makeHumanReadableEvent(
          lastEventType,
          lastEventContent,
          lastEventSender,
          client.getUserId(),
          true
        ),
        lastEventTime: lastEventTime,
      }
    });
  }

  componentWillMount() {
    document.addEventListener("keydown", this.handleKeyDown);
    window.mClient.addListener("Room.timeline", this.handleTimelineUpdate);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
    window.mClient.removeListener("Room.timeline", this.handleTimelineUpdate);
    window.stateStores.set("DMsView", this.state);
  }

  render() {
    const { cursor, rooms, showCallSelection } = this.state;

    let renderedRooms = rooms.map((room, index) => {
      return (
        <ChatDMItem
          displayName={room.displayName}
          avatar={room.avatarUrl}
          lastEvent={room.lastEvent}
          isFocused={index === cursor}
        />
      );
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
