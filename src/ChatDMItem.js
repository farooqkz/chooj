import { Component } from "inferno";
import Avatar from "./Avatar";
import IconListItem from "./ui/IconListItem";
import personIcon from "./person_icon.png";
import { makeHumanReadableEvent, getRoomLastEvent, getAvatarOrDefault } from "./utils";

export default class ChatDMItem extends Component {
  updateState = (evt, handler, t) => {
    console.log("RAPORT", evt);
    console.log("RAPORT", handler);
    console.log("RAPORT", t);
  };

  constructor(props) {
    super(props);
    let user = window.mClient.getUser(props.room.guessDMUserId());
    this.state = {
      presence: user.presence,
      lastActiveAgo: user.lastActiveAgo,
      avatarUrl: user.avatarUrl,
      displayName: user.displayName,
      lastEvent: makeHumanReadableEvent(getRoomLastEvent(props.room), true),
    };
  }

  componentWillMount() {
    let user = window.mClient.getUser(this.props.room.guessDMUserId());
    user.on("User", this.updateState);
  }

  componentWillUnmount() {
    let user = window.mClient.getUser(this.props.room.guessDMUserId());
    user.off("User", this.updateState);
  }

  render() {
    const { presence, displayName, avatarUrl } = this.state;
    const isFocused = this.props.isFocused;
    let avatar = getAvatarOrDefault(avatarUrl, personIcon);
    let lastEvent = this.state.lastEvent;
    if (lastEvent.length >= 33) lastEvent = lastEvent.slice(0, 33) + "...";

    return (
      <IconListItem
        icon={<Avatar avatar={avatar} online={presence} />}
        secondary={displayName}
        primary={lastEvent}
        isFocused={isFocused}
      />
    );
  }
}
