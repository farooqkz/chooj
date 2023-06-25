import { Component } from "inferno";
import { IRoomTimelineData, MatrixEvent, Room, RoomEvent } from "matrix-js-sdk";
import { IconListItem, Avatar } from "KaiUI";
import { makeHumanReadableEvent } from "./utils";
import roomIcon from "url:./hash_icon.png";
import { shared } from "./shared";

interface ChatRoomItemProps {
  roomId: string;
}

interface ChatRoomItemState {
  lastEvent: string;
  avatarUrl: string;
  displayName: string;
}

export default class ChatRoomItem extends Component<ChatRoomItemProps, ChatRoomItemState> {
  public state: ChatRoomItemState;
  onRoomNameUpdate = (room: Room) => {
    this.setState((state: ChatRoomItemState) => {
      state.displayName = room.name || state.displayName;
    });
  };
  
  onTimelineUpdate = (_evt: MatrixEvent, room: Room | undefined, _toStartOfTimeline: boolean | undefined, _removed: boolean, _data: IRoomTimelineData) => {
    this.setState((state: ChatRoomItemState) => {
      if (room) {
        let lastEvent: MatrixEvent | undefined = room.getLastLiveEvent();
        state.lastEvent = (lastEvent && makeHumanReadableEvent(lastEvent)) || state.lastEvent;
      }
      return state;
    });
  };

  constructor(props: ChatRoomItemProps) {
    super(props);
    if (!shared.mClient) {
      alert("mClient is null. This is probably a bug");
      throw new Error("mClient is null");
    }
    let room: Room | null = shared.mClient.getRoom(props.roomId);
    if (room) {
      let lastEvent: MatrixEvent | undefined = room.getLastLiveEvent();
      this.state = {
        lastEvent: (lastEvent && makeHumanReadableEvent(lastEvent)) || "",
        avatarUrl: room.getAvatarUrl(shared.mClient.baseUrl, 36, 36, "scale") || roomIcon,
        displayName: room.name,
      };
    } else {
      this.state = {
        lastEvent: "",
        avatarUrl: roomIcon,
        displayName: "Room not found"
      };
    }
    
  }

  componentDidMount() {
    if (!shared.mClient) { return; }
    let room: Room | null = shared.mClient.getRoom(this.props.roomId);
    if (!room) { return; } 
    room.on(RoomEvent.Name, this.onRoomNameUpdate);
    room.on(RoomEvent.Timeline, this.onTimelineUpdate);
  }
  
  componentWillUnmount() {
    if (!shared.mClient) { return; }
    let room: Room | null = shared.mClient.getRoom(this.props.roomId);
    if (!room) { return; } 
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
