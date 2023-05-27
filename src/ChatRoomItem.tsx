import { Component } from "inferno";
import { IRoomTimelineData, MatrixEvent, Room, RoomEvent } from "matrix-js-sdk";
import { IconListItem, Avatar } from "KaiUI";
import { makeHumanReadableEvent, getRoomLastEvent } from "./utils";
import roomIcon from "./hash_icon.png";

interface ChatRoomItemProps {
  roomId: string;
}

interface ChatRoomItemState {
  lastEvent: string;
  avatarUrl: string;
  displayName: string;
}

export default class ChatRoomItem extends Component<ChatRoomItemProps, ChatRoomItemState> {
  onRoomNameUpdate = (room: Room) => {
    this.setState((state: ChatRoomItemState) => {
      state.displayName = room.name || state.displayName;
    });
  };
  
  onTimelineUpdate = (_evt: MatrixEvent, room: Room | undefined, _toStartOfTimeline: Boolean | undefined, _removed: Boolean, _data: IRoomTimelineData) => {
    this.setState((state: ChatRoomItemState) => {
      let lastEvent: MatrixEvent | null = getRoomLastEvent(room);
      state.lastEvent = (lastEvent && makeHumanReadableEvent(lastEvent)) || state.lastEvent;
      return state;
    });
  };

  constructor(props: ChatRoomItemProps) {
    super(props);
    let room: Room = window.mClient.getRoom(props.roomId);
    let lastEvent: MatrixEvent | null = getRoomLastEvent(room);
    this.state = {
      lastEvent: (lastEvent && makeHumanReadableEvent(lastEvent)) || "",
      avatarUrl: room.getAvatarUrl(window.mClient.baseUrl, 36, 36, "scale") || roomIcon,
      displayName: room.name,
    };
  }

  componentDidMount() {
    let room: Room = window.mClient.getRoom(this.props.roomId);
    room.on(RoomEvent.Name, this.onRoomNameUpdate);
    room.on(RoomEvent.Timeline, this.onTimelineUpdate);
  }
  
  componentWillUnmount() {
    let room: Room = window.mClient.getRoom(this.props.roomId);
    room.off(RoomEvent.Name, this.onRoomNameUpdate);
    room.off(RoomEvent.Timeline, this.onTimelineUpdate);
  }

  render() {
    const { avatarUrl, displayName } = this.state;

    let lastEvent = this.state.lastEvent;
    lastEvent = lastEvent.length >= 25 ? lastEvent.slice(0, 25) + "..." : lastEvent;

    return (
      <IconListItem
        icon={<Avatar avatar={avatarUrl} />}
        secondary={displayName || ""}
        primary={lastEvent}
      />
    );
  }
}
