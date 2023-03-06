import { Component } from "inferno";

import { IconListItem, Avatar } from "KaiUI";
import { makeHumanReadableEvent, getRoomLastEvent } from "./utils";
import roomIcon from "./hash_icon.png";

export default class ChatRoomItem extends Component {
  onRoomNameUpdate = (a, b, c) => {
    console.log("RAPORT", a, b, c);
  };
  
  onTimelineUpdate = (a, b, c) => {
    console.log("ARAPORT", a, b, c);
  };
  
  onAvatarChange = (a, b, c) => {
    console.log("BRAPORT", a, b, c);
  };

  constructor(props) {
    super(props);
    let room = window.mClient.getRoom(props.roomId);
    this.state = {
      lastEvent: makeHumanReadableEvent(getRoomLastEvent(room)),
      avatarUrl: room.getAvatarUrl(window.mClient.baseUrl, 36, 36, "scale") || roomIcon,
      displayName: room.name,
    };
    console.log("HI", this.state);
  }

  componentDidMount() {
    let room = window.mClient.getRoom(this.props.roomId);
    room.on("Room.name", this.onRoomNameUpdate);
    room.on("Room.timeline", this.onTimelineUpdate);
  }
  
  componentWillUnmount() {
    let room = window.mClient.getRoom(this.props.roomId);
    room.off("Room.name", this.onRoomNameUpdate);
    room.off("Room.timeline", this.onTimelineUpdate);
  }

  render() {
    const { avatarUrl, displayName } = this.state;
    const isFocused = this.props.isFocused;

    let lastEvent = this.state.lastEvent;
    lastEvent = lastEvent.length >= 25 ? lastEvent.slice(0, 25) + "..." : lastEvent;

    return (
      <IconListItem
        icon={<Avatar avatar={avatarUrl} />}
        secondary={displayName || ""}
        primary={lastEvent || ""}
        isFocused={isFocused}
      />
    );
  }
}
