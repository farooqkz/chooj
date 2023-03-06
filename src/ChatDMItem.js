import { Component } from "inferno";
import { Avatar, IconListItem } from "KaiUI";
import personIcon from "./person_icon.png";
import { makeHumanReadableEvent, getRoomLastEvent, getAvatarOrDefault } from "./utils";

export default class ChatDMItem extends Component {
  updateDisplayName = (evt) => {
    console.log("DN", evt);
    this.setState((state) => {
      state.displayName = evt.getContent().displayName || state.displayName;
      return state;
    });
  };

  updateAvatar = (evt) => {
    console.log("A", evt);
    this.setState((state) => {
      state.avatarUrl = evt.getContent().avatarUrl || state.avatarUrl;
      return state;
    });
  };

  updatePresence = (evt, handler, t) => {
    console.log("RAPORT", evt);
    console.log("RAPORT", handler);
    console.log("RAPORT", t);
  };

  updateTimeline = (evt, _room) => { 
    this.setState({
      lastEvent: makeHumanReadableEvent(evt, true)
    });
  }

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

  componentDidMount() {
    let user = window.mClient.getUser(this.props.room.guessDMUserId());
    user.on("Room.membership", this.updatePresence);
    user.on("Room.membership", this.updateAvatar);
    user.on("Room.membership", this.updateDisplayName);
    this.props.room.on("Room.timeline", this.updateTimeline);
  }

  componentWillUnmount() {
    let user = window.mClient.getUser(this.props.room.guessDMUserId());
    user.off("User.presence", this.updatePresence);
    user.off("User.avatarUrl", this.updateAvatar);
    user.off("User.displayName", this.updateDisplayName);
    this.props.room.off("Room.timeline", this.updateTimeline);
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
