import { Component } from "inferno";

import IconListItem from "./ui/IconListItem";
import { makeHumanReadableEvent, getRoomLastEvent } from "./utils";
import Avatar from "./Avatar";
import roomIcon from "./hash_icon.png";

export default class ChatRoomItem extends Component {
  constructor(props) {
    super(props);
    let room = window.mClient.getRoom(props.roomId);
    this.state = {
      lastEvent: makeHumanReadableEvent(getRoomLastEvent(room)),
      avatarUrl: room.getAvatarUrl(window.mClient.baseUrl, 36, 36, "scale") || roomIcon,
      displayName: room.name,
    };
  }

  render() {
    const { avatarUrl, displayName } = this.state;
    const isFocused = this.props.isFocused;

    let lastEvent = this.state.lastEvent;
    lastEvent = lastEvent.length >= 33 ? lastEvent.slice(0, 33) + "..." : lastEvent;

    return (
      <IconListItem
        icon={<Avatar avatar={avatarUrl} />}
        secondary={displayName}
        primary={lastEvent}
        isFocused={isFocused}
      />
    );
  }
}
