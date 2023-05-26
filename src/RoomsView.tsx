import { Component } from "inferno";
import { ListViewKeyed } from "KaiUI";
import { Room, RoomEvent, MatrixEvent, IRoomTimelineData } from "matrix-js-sdk";

import ChatRoomItem from "./ChatRoomItem";
import { getRoomLastEvent, updateState, isRoom, isDM } from "./utils";
import NoItem from "./NoItem";
import { RoomsViewState, RoomsViewProps } from "./types";

class RoomsView extends Component<RoomsViewProps> {
  public state: RoomsViewState;

  cursorChangeCb = (cursor: number) => {
    const rooms = this.state.rooms;
    if (rooms.length !== 0) this.props.selectedRoomCb(rooms[cursor].roomId);
    else this.props.selectedRoomCb(null);
    this.setState({ cursor: cursor });
  };

  handleTimelineUpdate = (_evt: MatrixEvent, room?: Room, toStartOfTimeline?: Boolean, _removed: Boolean, data: IRoomTimelineData) => {
    if (!room || toStartOfTimeline || !data.liveEvent) {
      return;
    }
    if (!isRoom(room)) {
      if (isDM(room)) {
        // update DMsView saved state
        let state = window.stateStores.get("DMsView");
        state = updateState(room, state;
        window.stateStores.set("DMsView", state);
      }
      return;
    }
    this.setState((state: RoomsViewState) => updateState(room, state));
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
  
  componentDidMount() {
    window.mClient.on(RoomEvent.Timeline, this.handleTimelineUpdate);
  }

  componentWillUnmount() {
    window.mClient.off(RoomEvent.Timeline, this.handleTimelineUpdate);
    window.stateStores.set("RoomsView", this.state);
  }

  render() {
    const { cursor, rooms } = this.state;
    rooms.sort(
      (first: Room, second: Room) => getRoomLastEvent(first).getTs() - getRoomLastEvent(second).getTs() 
    );
    let renderedRooms = rooms.map((room: Room) => {
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
