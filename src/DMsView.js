import { Component, createPortal } from "inferno";

import ListView from "./ListView";
import ChatDMItem from "./ChatDMItem";
import TextListItem from "./ui/TextListItem";
import DropDownMenu from "./DropDownMenu";
import { updateState, getRoomLastEvent, isDM, isRoom } from "./utils";

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
      if (isRoom(room)) {
        // update RoomsView saved state
        let state = window.stateStores.get("RoomsView");
        state = updateState(room, state, false);
        window.stateStores.set("RoomsView", state);
      }
      return;
    }
    this.setState((state) => updateState(room, state));
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
    this.state.rooms = client
      .getVisibleRooms()
      .filter(isDM);
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
    const sortedRooms = rooms.sort(
      (first, second) => getRoomLastEvent(first).getTs() < getRoomLastEvent(second).getTs() 
    );
    let renderedRooms = sortedRooms.map((room, index) => {
      return (
        <ChatDMItem
          room={room}
          isFocused={index === cursor}
          key={room.roomId}
        />
      );
    });

    if (renderedRooms.length === 0) {
      renderedRooms.push(<TextListItem primary="No DM :(" isFocused key={0} />);
    }
    if (showCallSelection)
      return (
        <>
          <ListView cursor={cursor} cursorChangeCb={this.cursorChangeCb} $HasKeyedChildren>
            {renderedRooms}
          </ListView>
          {createPortal(
            <CallSelectionMenu selectCb={this.startCall} />,
            document.getElementById("menu")
          )}
        </>
      );
    return (
      <ListView cursor={cursor} cursorChangeCb={this.cursorChangeCb} $HasKeyedChildren>
        {renderedRooms}
      </ListView>
    );
  }
}

export default DMsView;
