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

  constructor(props) {
    super(props);
    this.state = {
      lastEvent: "",
      online: "offline",
      displayName: "",
    };
  }

  componentWillMount() {
    window.mClient.addListener("User.presence", this.updatePresence);
  }

  componentWillUnmount() {
    window.mClient.removeListener("User.presence", this.updatePresence);
  }

  render() {
    return (
      <IconListItem
        icon=<Avatar avatar={this.props.avatar} online={this.state.online} />
        primary={this.state.displayName || this.props.userId}
        secondary={this.state.lastEvent}
        key={this.props.isFocused}
        isFocused={this.props.isFocused}
      />
    );
  }
}

export default ChatDMItem;
