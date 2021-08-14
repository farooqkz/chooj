import { Component } from "inferno";
import ListView from "./ListView";
import Header from "./ui/Header";
import SoftKey from "./ui/SoftKey";
import IRCLikeMessageItem from "./IRCLikeMessageItem";
import "./UnsupportedEventItem.css";

function UnsupportedEventItem(props) {
  return (
    <div className={"unsupportedevent" + (props.isFocused ? "--focused" : "")}>
      <p>Unsupported Event from {props.senderId}</p>
    </div>
  );
}

class RoomView extends Component {
  cursorChangeCb = (cursor) => {
    this.setState({ cursor: cursor });
  };

  constructor(props) {
    super(props);
    this.room = window.mClient.getRoom(props.roomId);
    if (this.room === null) {
      alert("Cannot retrieve room information");
      props.closeRoomView();
    }
    this.state = {
      showMenu: false,
      cursor: 0,
    };
  }

  render() {
    const MessageItem = IRCLikeMessageItem;
    return (
      <>
        <Header text="RoomNameHERE" />
        <ListView
          cursor={this.state.cursor}
          cursorChangeCb={this.cursorChangeCb}
          height="calc(100vh - 2.8rem - 60px)"
        >
          {this.room
            .getLiveTimeline()
            .getEvents()
            .map((evt, index) => {
              let senderId = evt.getSender();
              let content = evt.getContent();
              let type = evt.getType();
              let item = null;
              if (type === "m.room.message") {
                item = (
                  <MessageItem
                    sender={{ userId: senderId }}
                    content={content}
                  />
                );
              } else {
                item = <UnsupportedEventItem senderId={senderId} />;
              }
              if (item) item.props.isFocused = index === this.state.cursor;
              return item;
            })}
        </ListView>
        <footer $HasVNodeChildren>
          <SoftKey />
        </footer>
      </>
    );
  }
}

export default RoomView;
