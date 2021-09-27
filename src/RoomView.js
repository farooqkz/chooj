import { Component } from "inferno";
import ListView from "./ListView";
import Header from "./ui/Header";
import SoftKey from "./ui/SoftKey";
import IRCLikeMessageItem from "./IRCLikeMessageItem";
import ChatTextInput from "./ChatTextInput";
import "./UnsupportedEventItem.css";
import "./RoomView.css";

function UnsupportedEventItem(props) {
  return (
    <div className={"unsupportedevent" + (props.isFocused ? "--focused" : "")}>
      <p>Unsupported Event from {props.senderId}</p>
    </div>
  );
}

class RoomView extends Component {
  cursorChangeCb = (cursor) => {
    this.setState((prevState) => {
      const lastEventIndex = this.room.getLiveTimeline().getEvents().length - 1;
      if (prevState.cursor === lastEventIndex && cursor === 0) {
        prevState.textInputFocus = true;
      } else {
        prevState.cursor = cursor;
      }
      return prevState;
    });
  };

  messageChangeCb = (message) => {
    this.setState({ message: message });
  };

  handleKeyDown = (event) => {
    if (event.key !== "b" && event.key !== "Backspace") {
      return;
    }
    if (this.state.textInputFocus && this.state.message) return;
    event.preventDefault();
    this.props.closeRoomView();
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
        if (this.state.message === "") {
          alert("Not sending empty message!");
          break;
        }
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
    } else if (this.state.textInputFocus) {
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
      return;
    }
    const lastEventIndex = this.room.getLiveTimeline().getEvents().length - 1;
    this.state = {
      showMenu: false,
      cursor: lastEventIndex,
      message: "",
      textInputFocus: true,
    };
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }
  render() {
    const MessageItem = IRCLikeMessageItem;
    return (
      <>
        <Header text={this.room.calculateRoomName()} />
        <div className="eventsandtextinput">
          <ListView
            cursor={this.state.cursor}
            cursorChangeCb={this.cursorChangeCb}
            height="calc(100vh - 2.8rem - 40px - 32px)"
          >
            {this.room
              .getLiveTimeline()
              .getEvents()
              .map((evt, index, ary) => {
                let item = null;
                if (evt.getType() === "m.room.message") {
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
          <ChatTextInput
            message={this.state.message}
            onChangeCb={this.messageChangeCb}
            isFocused={this.state.textInputFocus}
            unFocusIt={() => this.setState({ textInputFocus: false })}
          />
        </div>
        <footer $HasVNodeChildren>
          <SoftKey centerText={this.getCenterText()} centerCb={this.centerCb} />
        </footer>
      </>
    );
  }
}

export default RoomView;
