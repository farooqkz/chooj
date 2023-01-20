import { Component } from "inferno";
import Header from "../ui/Header";
import SoftKey from "../ui/SoftKey";
import { IRCLikeMessageItem } from "../MessageItems";
import { isDM, isRoom, updateState } from "../utils";
import ChatTextInput from "../ChatTextInput";
import VoiceInput from "../VoiceInput";
import ScrollIntoView from "./ScrollIntoView";
import "./UnsupportedEventItem.css";
import "./RoomView.css";
import WaitingCurve from "./waiting_curve.svg";

function IRCLikeUnsupportedEventItem({ isFocused, senderId }) {
  return (
    <div className={"unsupportedevent" + (isFocused ? "--focused" : "")}>
      <p $HasTextChildren>Unsupported Event from {senderId}</p>
    </div>
  );
}

function CannotSendMessage() { // eslint-disable-line no-unused-vars
  return (
    <div style={{ "background-color": "gray" }}>
      <h5>Cannot send message to this room</h5>
    </div>
  );
}

function Waiting() {
  return (
    <div>
      <img src={WaitingCurve} height="16px" width="16px" alt="" />
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
    if (window.mClient.getUserId() === member.userId) {
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
    const { cursor, textInputFocus, message, waiting } = this.state;
    const { closeRoomView } = this.props;
    const lastEventIndex = this.room.getLiveTimeline().getEvents().lastIndex;
    if (VALID_KEYS.slice(0, 2).includes(evt.key)) {
      if (textInputFocus && message) return;
      evt.preventDefault();
      closeRoomView();
    } else if (evt.key === "ArrowDown") {
      if (cursor === lastEventIndex) {
        this.setState({ textInputFocus: true });
      } else {
        this.setState({ cursor: cursor + 1 });
      }
    } else if (evt.key === "ArrowUp") {
      if (waiting) { return; }
      if (textInputFocus) {
        this.setState({ textInputFocus: false, cursor: lastEventIndex });
      } else if (cursor === 0) {
        let prev = this.timeline.getEvents().lastIndex;
        this.setState({ waiting: true });
        window.mClient
          .paginateEventTimeline(this.timeline, { backwards: true, limit: 10 })
          .then((notReachedEnd) => {
            if (notReachedEnd) {
              const current = this.timeline.getEvents().lastIndex;
              this.setState({
                cursor: current - prev,
                waiting: false,
              });
            }
          });
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
      let events = this.timeline.getEvents();
      const lastEventIndex = events.lastIndex;
      const { cursor, textInputFocus } = this.state;
      if (textInputFocus) {
        // partial support
        window.mClient.sendReadReceipt(evt);
      }
      this.setState({
        cursor: textInputFocus ? lastEventIndex : cursor,
      });
    }
  };

  getLeftText = () => {
    if (this.state.textInputFocus) return "+";
    const currentEvt = this.currentEvent;
    let msgtype = currentEvt.getContent().msgtype;
    if (msgtype === "m.audio") return "Vol.";
    return "";
  };

  leftCb = () => {
    if (this.getLeftText() === "+") {
      alert("Not implemented yet");
    }
    if (this.getLeftText() === "Vol.") {
      navigator.volumeManager.requestShow();
    }
  };

  centerCb = () => {
    const { message, isRecording } = this.state;
    const { roomId } = this.props;
    switch (this.getCenterText()) {
      case "Select":
        // TODO: start call or something
        break;
      case "Listen":
        let audio = document.querySelector(".ircmsg--focused>p>audio");
        audio.play();
        break;
      case "Send":
        if (isRecording) {
          this.recorder.stop();
          clearInterval(this.recordingInterval);
          this.setState({
            isRecording: false,
          });
          break;
        }
        if (message === "") {
          alert("Not sending empty message!");
          break;
        }
        window.mClient.sendTextMessage(roomId, message);
        this.setState({ message: "" });
        break;
      case "View":
        alert("Not implemented yet");
        //TODO: show enlarged image
        break;
      case "Voice":
        this.setState({
          isRecording: true,
          recordingSeconds: 0,
        });
        this.recorder.start();
        this.recordingInterval = setInterval(() => {
          this.setState((state) => {
            state.recordingSeconds += 0.01;
            return state;
          });
        }, 10);
        break;
      default:
        break;
    }
  };

  getCenterText = () => {
    const { isRecording, showMenu, textInputFocus, message } = this.state;
    const currentEvt = this.currentEvent;
    if (isRecording) {
      return "Send";
    }
    if (showMenu) {
      return "Select";
    } else if (textInputFocus) {
      if (message === "") {
        return "Voice";
      } else {
        return "Send";
      }
    } else if (currentEvt && currentEvt.getType() === "m.room.message") {
      let msgtype = currentEvt.getContent().msgtype;
      if (msgtype === "m.audio") return "Listen";
      else if (msgtype === "m.image") return "View";
      else return "";
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
    this.currentEvent = null;
    this.timeline = this.room.getLiveTimeline();
    this.recorder = null;
    this.recording = [];
    this.recordingInterval = 0;
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      this.recorder = new MediaRecorder(stream);
      this.recorder.ondataavailable = (evt) => {
        this.recording.push(evt.data);
      };
      this.recorder.onstop = () => {
        let blob = new Blob(this.recording);
        let size = blob.size;
        let duration = parseInt(this.state.recordingSeconds * 1000);
        let mimetype = blob.type;
        window.mClient
          .uploadContent(blob, {
            type: mimetype,
          })
          .then((response) => {
            const mxcUrl = response;
            const roomId = this.props.roomId;
            window.mClient
              .sendMessage(roomId, {
                body: this.state.message || "Voice message",
                info: {
                  duration: duration,
                  size: size,
                  mimetype: mimetype,
                },
                url: mxcUrl,
                msgtype: "m.audio",
              })
              .catch((err) => console.log(err));
          })
          .catch(() => alert("Cannot send voice"));
      };
    });
    const lastEventIndex = this.timeline.getEvents().lastIndex;
    this.state = {
      showMenu: false,
      cursor: lastEventIndex,
      message: "",
      textInputFocus: true,
      isRecording: false,
      recordingSeconds: 0,
      waiting: false,
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
    const {
      isRecording,
      recordingSeconds,
      cursor,
      message,
      textInputFocus,
      typing,
      waiting,
    } = this.state;
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
            {waiting ? <Waiting /> : null }
            {this.timeline.getEvents().map((evt, index) => {
              let item = null;
              const senderId = evt.getSender();
              if (evt.getType() === "m.room.message") {
                item = (
                  <MessageItem
                    date={evt.getDate()}
                    sender={{ userId: senderId }}
                    content={evt.getContent()}
                  />
                );
              } else {
                item = <UnsupportedEventItem senderId={senderId} />;
              }

              if (index === cursor && !textInputFocus) {
                item.props.isFocused = true;
                this.currentEvent = evt;
              }

              return (
                <ScrollIntoView shouldScroll={index === cursor}>
                  {item}
                </ScrollIntoView>
              );
            })}
          </div>
          {isRecording ? (
            <VoiceInput seconds={recordingSeconds} title={message} />
          ) : (
            <ChatTextInput
              message={message}
              onChangeCb={this.messageChangeCb}
              isFocused={textInputFocus}
            />
          )}
        </div>
        <footer>
          <SoftKey
            centerText={this.getCenterText()}
            centerCb={this.centerCb}
            leftText={this.getLeftText()}
            leftCb={this.leftCb}
          />
        </footer>
      </>
    );
  }
}

export default RoomView;
