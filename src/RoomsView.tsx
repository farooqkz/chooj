import { Component } from "inferno";
import { ListViewKeyed } from "KaiUI";
import { Room, RoomEvent, MatrixEvent, IRoomTimelineData } from "matrix-js-sdk";

import ChatRoomItem from "./ChatRoomItem";
import { updateState, isRoom, isDM } from "./utils";
import NoItem from "./NoItem";
import { shared } from "./shared";
import { RoomsViewState, RoomsViewProps } from "./types";

class RoomsView extends Component<RoomsViewProps> {
  public state: RoomsViewState;

  cursorChangeCb = (cursor: number) => {
    const rooms = this.state.rooms;
    if (rooms.length !== 0) this.props.selectedRoomCb(rooms[cursor].roomId);
    else this.props.selectedRoomCb(null);
    this.setState({ cursor: cursor });
  };

  handleTimelineUpdate = (_evt: MatrixEvent, room: Room | undefined, toStartOfTimeline: boolean | undefined, _removed: boolean, data: IRoomTimelineData) => {
    if (!room || toStartOfTimeline || !data.liveEvent) {
      return;
    }
    if (!isRoom(room)) {
      if (isDM(room)) {
        // update DMsView saved state
        let state: RoomsViewState | undefined = shared.stateStores.get("DMsView");
        if (state) {
          state = updateState(room, state);
          shared.stateStores.set("DMsView", state);
        }
      }
      return;
    }
    this.setState((state: RoomsViewState) => updateState(room, state));
  };

  constructor(props: any) {
    super(props);
    const client = shared.mClient;
    if (!client) {
      throw new Error("mClient is null");
    }
    this.state = shared.stateStores.get("RoomsView") || {
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
    shared.mClient && shared.mClient.on(RoomEvent.Timeline, this.handleTimelineUpdate);
  }

  componentWillUnmount() {
    shared.mClient && shared.mClient.off(RoomEvent.Timeline, this.handleTimelineUpdate);
    shared.stateStores.set("RoomsView", this.state);
  }

  render() {
    const { cursor, rooms } = this.state;
    rooms.sort(
      (first: Room, second: Room) => {
        let firstLastEvent: MatrixEvent | undefined = first.getLastLiveEvent();
        let secondLastEvent: MatrixEvent | undefined = second.getLastLiveEvent();
        let firstTs: number = firstLastEvent ? firstLastEvent.getTs() : 0;
        let secondTs: number = secondLastEvent ? secondLastEvent.getTs() : 0;
        // ^ Please don't get tempted to rewrite these two using 
        // logical AND and OR. I think it is more readable this way.
        // -- Farooq
        return firstTs - secondTs;
    });
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
