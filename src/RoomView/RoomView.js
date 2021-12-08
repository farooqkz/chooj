import { Component } from "inferno";
import Header from "../ui/Header";
import SoftKey from "../ui/SoftKey";
import { IRCLikeMessageItem } from "../MessageItems";
import { isDM, isRoom, updateState } from "../utils";
import ChatTextInput from "../ChatTextInput";
import ScrollIntoView from "./ScrollIntoView";
import "./UnsupportedEventItem.css";
import "./RoomView.css";

function IRCLikeUnsupportedEventItem({ isFocused, senderId }) {
  return (
    <div className={"unsupportedevent" + (isFocused ? "--focused" : "")}>
      <p $HasTextChildren>Unsupported Event from {senderId}</p>
    </div>
  );
}

class RoomView extends Component {
  messageChangeCb = (message) => {
    this.setState({ message: message });
    window.mClient.sendTyping(this.room.roomId, true, 75);
  };
  
  handleTyping = (evt, member) => {
    if (member.roomId !== this.room.roomId) {
      return;
    }
    if (!this.dm) {
      // currently there is no typing notif for non DM rooms
      return;
    }
    this.setState({ typing: member.typing });
  };

  handleKeyDown = (evt) => {
    const VALID_KEYS = ["b", "Backspace", "ArrowDown", "ArrowUp"];
    // Backspace is used on an actual device
    // b is used for testing in desktop browser
    if (!VALID_KEYS.includes(evt.key)) {
      return;
    }
    const { cursor, textInputFocus, message } = this.state;
    const { closeRoomView } = this.props;
    const lastEventIndex = this.room.getLiveTimeline().getEvents().length - 1;
    if (VALID_KEYS.slice(0, 2).includes(evt.key)) {
      if (textInputFocus && message) return;
      evt.preventDefault();
      closeRoomView();
    } else if (evt.key === "ArrowDown") {
      if (textInputFocus) {
        this.setState({ textInputFocus: false, cursor: 0 });
      } else if (cursor === lastEventIndex) {
        this.setState({ textInputFocus: true });
      } else {
        this.setState({ cursor: cursor + 1 });
      }
    } else if (evt.key === "ArrowUp") {
      if (textInputFocus) {
        this.setState({ textInputFocus: false, cursor: lastEventIndex });
      } else if (cursor === 0) {
        this.setState({ textInputFocus: true, cursor: lastEventIndex });
      } else {
        this.setState({ cursor: cursor - 1 });
      }
    }
  };

  handleTimelineUpdate = (evt, room, ts) => {
    if (isRoom(room)) {
      let roomsViewState = window.stateStores.get("RoomsView");
      roomsViewState = updateState(room, roomsViewState, false);
      window.stateStores.set("RoomsView", roomsViewState);
    }
    if (isDM(room)) {
      let roomsViewState = window.stateStores.get("DMsView");
      roomsViewState = updateState(room, roomsViewState, true);
      window.stateStores.set("DMsView", roomsViewState);
    }
    if (room.roomId === this.room.roomId) {
      let events = room.getLiveTimeline().getEvents();
      const lastEventIndex = events.length - 1;
      const { cursor, textInputFocus } = this.state;
      if (textInputFocus) { // partial support for read markers
        window.mClient.setRoomReadMarkers(
          room.roomId,
          events[lastEventIndex].getId()
        );
      }
      this.setState({
        cursor: textInputFocus ? lastEventIndex : cursor,
      });
    }
  };

  centerCb = () => {
    const { message } = this.state;
    const { roomId } = this.props;
    switch (this.getCenterText()) {
      case "Select":
        // TODO: start call or something
        break;
      case "Info":
        alert("Message Info not implemented yet");
        break;
      case "Send":
        if (message === "") {
          alert("Not sending empty message!");
          break;
        }
        window.mClient.sendTextMessage(roomId, message);
        this.setState({ message: "" });
        break;
      default:
        break;
    }
  };

  getCenterText = () => {
    const { showMenu, textInputFocus } = this.state;
    if (showMenu) {
      return "Select";
    } else if (textInputFocus) {
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
    this.dm = isDM(this.room);
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
    window.mClient.addListener("Room.timeline", this.handleTimelineUpdate);
    window.mClient.addListener("RoomMember.typing", this.handleTyping);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
    window.mClient.removeListener("Room.timeline", this.handleTimelineUpdate);
    window.mClient.removeListener("RoomMember.typing", this.handleTyping);
  }

  render() {
    const MessageItem = IRCLikeMessageItem;
    const UnsupportedEventItem = IRCLikeUnsupportedEventItem;
    const { cursor, message, textInputFocus, typing } = this.state;

    return (
      <>
        <Header text={typing ? "Typing..." : this.room.name} />
        <div
          className="eventsandtextinput"
          ref={(ref) => {
            this.eventsDiv = ref;
          }}
        >
          <div
            className={"kai-list-view"}
            style={{ height: "calc(100vh - 2.8rem - 40px - 32px)" }}
          >
            {this.room
              .getLiveTimeline()
              .getEvents()
              .map((evt, index, ary) => {
                let item = null;
                const senderId = evt.getSender();
                if (evt.getType() === "m.room.message") {
                  item = (
                    <MessageItem
                      sender={{ userId: senderId }}
                      content={evt.getContent()}
                    />
                  );
                } else {
                  item = <UnsupportedEventItem senderId={senderId} />;
                }

                if (index === cursor && !textInputFocus)
                  item.props.isFocused = true;

                if (Math.abs(index - cursor) <= 2) {
                  window.mClient.setRoomReadMarkers(this.room.roomId, evt.getId());
                }

                return (
                  <ScrollIntoView shouldScroll={index === cursor}>
                    {item}
                  </ScrollIntoView>
                );
              })}
          </div>
          <ChatTextInput
            message={message}
            onChangeCb={this.messageChangeCb}
            isFocused={textInputFocus}
          />
        </div>
        <footer>
          <SoftKey centerText={this.getCenterText()} centerCb={this.centerCb} />
        </footer>
      </>
    );
  }
}

export default RoomView;
