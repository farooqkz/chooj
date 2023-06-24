import { Component, createPortal } from "inferno";
import {
  ListViewKeyed,
  TextListItem,
  DropDownMenu,
} from "KaiUI";
import { Room, MatrixEvent } from "matrix-js-sdk";
import ChatDMItem from "./ChatDMItem";
import { updateState, getRoomLastEvent, isDM, isRoom } from "./utils";
import NoItem from "./NoItem";
import { startCall } from "./types";

interface DMsViewProps {
  startCall: startCall;
  selectedRoomCb: (roomId: string | null) => void;
}

interface DMsViewState {
  cursor: number;
  showCallSelection: boolean;
  rooms: Array<Room>;
}

function CallSelectionMenu({ selectCb }: { selectCb: (type) => void }) {
  return (
    <DropDownMenu
      title="Start call"
      selectCb={selectCb}
      labels={["voice", "video"]}
    >
      <TextListItem primary="Voice call" />
      <TextListItem primary="Video call" />
    </DropDownMenu>
  );
}

class DMsView extends Component<DMsViewProps, DMsViewState> {
  handleKeyDown = (evt: KeyboardEvent) => {
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

  startCall = (type: string) => {
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

  cursorChangeCb = (cursor: number) => {
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
/*
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
*/
  constructor(props: DMsViewProps) {
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
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
    window.stateStores.set("DMsView", this.state);
  }

  render() {
    const { cursor, rooms, showCallSelection } = this.state;
    rooms.sort(
      (first: Room, second: Room) => {
        let firstRoomEvent: MatrixEvent | null = getRoomLastEvent(first);
        let secondRoomEvent: MatrixEvent | null = getRoomLastEvent(second);
        return (firstRoomEvent && firstRoomEvent.getTs()) || 0 - ((secondRoomEvent && secondRoomEvent.getTs()) || 0);
      });
    let renderedRooms = rooms.map((room: Room) => {
      return (
        <ChatDMItem
          room={room}
          key={room.roomId}
        />
      );
    });

    if (renderedRooms.length === 0) {
      return <NoItem text="You haven't got any DM" />;
    }
    return (
      <>
        <ListViewKeyed cursor={cursor} cursorChangeCb={this.cursorChangeCb} $HasKeyedChildren>
          {renderedRooms}
        </ListViewKeyed>
        { showCallSelection ? createPortal(
          <CallSelectionMenu selectCb={this.startCall} />,
          document.getElementById("menu")
        ) : null}
      </>
    );
  }
}

export default DMsView;
