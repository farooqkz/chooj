import { Component } from "inferno";
import { ListViewKeyed, TextListItem } from "KaiUI";

import ChatRoomItem from "./ChatRoomItem";
import { getRoomLastEvent, updateState, isRoom, isDM } from "./utils";
import NoItem from "./NoItem";

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
      .filter(isRoom);
  }

  componentWillMount() {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
    window.stateStores.set("RoomsView", this.state);
  }

  render() {
    const { cursor, rooms } = this.state;
    const sortedRooms = rooms.sort(
      (first, second) => getRoomLastEvent(first).getTs() < getRoomLastEvent(second).getTs() 
    );
    let renderedRooms = sortedRooms.map((room) => {
      return (
        <ChatRoomItem
          roomId={room.roomId}
          key={room.roomId}
        />
      );
    });
    if (renderedRooms.length === 0) {
      return <NoItem text="You are not in any room" />;
    }
    return (
      <ListViewKeyed cursor={cursor} cursorChangeCb={this.cursorChangeCb} $HasKeyedChildren>
        {renderedRooms}
      </ListViewKeyed>
    );
  }
}

export default RoomsView;
