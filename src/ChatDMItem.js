import { Component } from "inferno";
import Avatar from "./Avatar";
import IconListItem from "./ui/IconListItem";

class ChatDMItem extends Component {
  updatePresence = (event, user) => {
    if (user.userId === this.props.userId)
      this.setState({
        online: user.presence,
        displayName: user.displayName,
      });
  };

  updateLastEvent = (event, room, ts) => {
    if (!ts) console.log(event, room);
  };

  constructor(props) {
    super(props);
    this.lastEventTime = -1;
    this.state = {
      lastEvent: props.lastEvent,
      online: "offline",
      displayName: "",
    };
  }

  componentWillMount() {
    window.mClient.addListener("User.presence", this.updatePresence);
    window.mClient.addListener("Room.timeline", this.updateLastEvent);
  }

  componentWillUnmount() {
    window.mClient.removeListener("User.presence", this.updatePresence);
    window.mClient.removeListener("Room.timeline", this.updateLastEvent);
  }

  render() {
    return (
      <IconListItem
        icon=<Avatar avatar={this.props.avatar} online={this.state.online} />
        secondary={this.state.displayName || this.props.userId}
        primary={this.state.lastEvent}
        key={this.props.isFocused}
        isFocused={this.props.isFocused}
      />
    );
  }
}

export default ChatDMItem;
