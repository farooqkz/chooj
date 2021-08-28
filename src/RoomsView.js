import { Component } from "inferno";

import ListView from "./ListView";
import personIcon from "./person_icon.png";
import ChatRoomItem from "./ChatRoomItem";
import TextListItem from "./ui/TextListItem";
import { makeHumanReadableEvent } from "./utils";

class RoomsView extends Component {
  handleKeyDown = (evt) => {
  };

  cursorChangeCb = (cursor) => {
    this.props.selectedRoomCb(this.rooms[cursor].roomId);
    this.setState({ cursor: cursor });
  };

  getRooms = (room) =>
    room.getJoinedMemberCount() > 2 && room.getMyMembership() === "join";

  constructor(props) {
    super(props);
    this.rooms = [];
    this.state = {
      cursor: 0,
    };
  }

  componentWillMount() {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  render() {
    const client = window.mClient;
    this.rooms = client
      .getVisibleRooms()
      .filter(this.getRooms)
      .map((room) => {
        let roomEvents = room.getLiveTimeline().getEvents();
        let lastEvent = roomEvents[roomEvents.length - 1];
        const lastEventTime = lastEvent.getTs();
        const lastEventContent = lastEvent.getContent();
        const lastEventType = lastEvent.getType();
        const lastEventSender = lastEvent.getSender();
        const roomId = room.roomId;
        let avatarUrl;
        avatarUrl = personIcon;
        return {
          roomId: roomId,
          avatarUrl: avatarUrl,
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
        <ChatRoomItem
          roomId={room.roomId}
          avatar={room.avatarUrl}
          lastEvent={room.lastEvent}
        />
      );
      item.props.isFocused = index === this.state.cursor;
      return item;
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
