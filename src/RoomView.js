import { Component } from "inferno";
import ListView from "./ListView";
import Header from "./ui/Header";
import SoftKey from "./ui/SoftKey";
import IRCLikeMessageItem from "./IRCLikeMessageItem";
import ChatTextInput from "./ChatTextInput";
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
  
  messageChangeCb = (message) => {
    this.setState({ message: message });
  };

  centerCb = () => {
    switch (this.getCenterText()) {
      case "Select":
        // TODO: start call or something
        break;
      case "Info":
        alert("Message Info not implemented yet");
        break;
      case "Send":
        console.log(this.state.message);
        window.mClient.sendTextMessage(this.props.roomId, this.state.message);
        this.setState((prevState) => {
          return { message: "", cursor: prevState.cursor + 1 };
        });
        break;
      default:
        break;
    }
  };

  getCenterText = () => {
    if (this.state.showMenu) {
      return "Select";
    } else if (this.state.cursor === this.room.getLiveTimeline().getEvents().length) {
      return "Send";
    } else {
      return "Info";
    }
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
      message: "",
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
          height="calc(100vh - 2.8rem - 40px)"
        >
          {this.room
            .getLiveTimeline()
            .getEvents()
            .concat(["INSERT TEXTINPUT HERE"])
            .map((evt, index, ary) => {
              let item = null;
              if (evt === "INSERT TEXTINPUT HERE") {
                item = <ChatTextInput
                          message={this.state.message}
                          send={this.sendMessage}
                          onChangeCb={this.messageChange} />;
              } else if (evt.getType() === "m.room.message") {
                item = (
                  <MessageItem
                    sender={{ userId: evt.getSender() }}
                    content={evt.getContent()}
                  />
                );
              } else {
                item = <UnsupportedEventItem senderId={evt.getSender()} />;
              }
              if (item) item.props.isFocused = index === this.state.cursor;
              return item;
            })}
        </ListView>
        <footer $HasVNodeChildren>
          <SoftKey centerText={this.getCenterText()} centerCb={this.centerCb} />
        </footer>
      </>
    );
  }
}

export default RoomView;
