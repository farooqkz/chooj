import { Component } from "inferno";

import ListView from "./ListView";
import ChatRoomItem from "./ChatRoomItem";
import TextListItem from "./ui/TextListItem";
import { newRoomInState, updateState, isRoom, isDM } from "./utils";

class RoomsView extends Component {
  cursorChangeCb = (cursor) => {
    const rooms = this.state.rooms;
    if (rooms.length !== 0) this.props.selectedRoomCb(rooms[cursor].roomId);
    else this.props.selectedRoomCb(null);
    this.setState({ cursor: cursor });
  };

  handleTimelineUpdate = (evt, room, toStartOfTimeline, removed, data) => {
    if (!room || toStartOfTimeline || !data.liveEvent) {
      return;
    }
    if (!isRoom(room)) {
      if (isDM(room)) {
        // update DMsView saved state
        let state = window.stateStores.get("DMsView");
        state = updateState(room, state, true);
        window.stateStores.set("DMsView", state);
      }
      return;
    }
    this.setState((state) => updateState(room, state, false));
  };

  constructor(props) {
    super(props);
    const client = window.mClient;
    this.state = window.stateStores.get("RoomsView") || {
      cursor: 0,
      rooms: [],
    };
    if (this.state.rooms.length !== 0) {
      return;
    }
    this.state.rooms = client
      .getVisibleRooms()
      .filter(isRoom)
      .map((room) => newRoomInState(room, false));
  }

  componentWillMount() {
    document.addEventListener("keydown", this.handleKeyDown);
    window.mClient.addListener("Room.timeline", this.handleTimelineUpdate);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
    window.mClient.removeListener("Room.timeline", this.handleTimelineUpdate);
    window.stateStores.set("RoomsView", this.state);
  }

  render() {
    const { cursor, rooms } = this.state;
    let renderedRooms = rooms.map((room, index) => {
      return (
        <ChatRoomItem
          roomId={room.roomId}
          displayName={room.displayName}
          avatar={room.avatarUrl}
          lastEvent={room.lastEvent}
          isFocused={index === cursor}
        />
      );
    });

    if (renderedRooms.length === 0) {
      renderedRooms.push(<TextListItem primary="No Rooms :(" isFocused />);
    }
    return (
      <ListView cursor={this.state.cursor} cursorChangeCb={this.cursorChangeCb}>
        {renderedRooms}
      </ListView>
    );
  }
}

export default RoomsView;
