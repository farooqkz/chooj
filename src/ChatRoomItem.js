import { Component } from "inferno";
import Avatar from "./Avatar";
import IconListItem from "./ui/IconListItem";

class ChatRoomItem extends Component {
  updateLastEvent = (event, room, ts) => {
    if (!ts) console.log(event, room);
  };

  constructor(props) {
    super(props);
    this.lastEventTime = -1;
    this.room = window.mClient.getRoom(props.roomId);
    this.state = {
      lastEvent: props.lastEvent,
      displayName: this.room ? this.room.calculateRoomName() : "",
    };
  }

  componentWillMount() {
    window.mClient.addListener("Room.timeline", this.updateLastEvent);
  }

  componentWillUnmount() {
    window.mClient.removeListener("Room.timeline", this.updateLastEvent);
  }

  render() {
    return (
      <IconListItem
        icon=<Avatar avatar={this.props.avatar} online={"online"} />
        secondary={this.state.displayName}
        primary={this.state.lastEvent}
        key={this.props.isFocused}
        isFocused={this.props.isFocused}
      />
    );
  }
}

export default ChatRoomItem;
