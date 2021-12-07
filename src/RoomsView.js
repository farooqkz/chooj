import { Component } from "inferno";

import ListView from "./ListView";
import ChatRoomItem from "./ChatRoomItem";
import TextListItem from "./ui/TextListItem";
import { isRoom, makeHumanReadableEvent } from "./utils";

import hashIcon from "./hash_icon.png";


const AVATAR_SIZE = 36;

class RoomsView extends Component {
  cursorChangeCb = (cursor) => {
    const rooms = this.state.rooms;
    if (rooms.length !== 0)
      this.props.selectedRoomCb(rooms[cursor].roomId);
    else this.props.selectedRoomCb(null);
    this.setState({ cursor: cursor });
  };

  handleTimelineUpdate = (evt, room, toStartOfTimeline, removed, data) => {
    if (!room || toStartOfTimeline || !data.liveEvent) {
      return;
    }
    if (!isRoom(room)) {
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
            false
          );
        }
        return ourRoom;
      });
      if (!isAlreadyOurRoom) {
        let lastEvent = room.timeline[room.timeline.length - 1];

        state.rooms.push({
          avatarUrl: room.getAvatarUrl(window.client.baseUrl, AVATAR_SIZE, AVATAR_SIZE, "scale"),
          displayName: room.calculateRoomName(),
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
    this.state = window.stateStores.get("RoomsView") || {
      cursor: 0,
      rooms: [],
    };
    if (this.state.rooms.length !== 0) {
      return;
    }
    this.state.rooms = client.getVisibleRooms().filter(isRoom).map((room) => {
      let roomEvents = room.getLiveTimeline().getEvents();
      let lastEvent = roomEvents[roomEvents.length - 1];
      const lastEventTime = lastEvent.getTs();
      const lastEventContent = lastEvent.getContent();
      const lastEventType = lastEvent.getType();
      const lastEventSender = lastEvent.getSender();
      const avatarUrl = room.getAvatarUrl(client.baseUrl, AVATAR_SIZE, AVATAR_SIZE, "scale") || hashIcon;
      return {
        avatarUrl: avatarUrl,
        displayName: room.calculateRoomName(),
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
