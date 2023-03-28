import { Component } from "inferno";
import { extensionOf } from "xmimetype";
import { Header, SoftKey } from "KaiUI";
import { isDM, isRoom, updateState, mxcMediaToHttp } from "../utils";
import ChatTextInput from "../ChatTextInput";
import VoiceInput from "../VoiceInput";
import ScrollIntoView from "./ScrollIntoView";
import "./RoomView.css";
import WaitingCurve from "./waiting_curve.svg";
import RoomEvent from "./RoomEvent";
import ImageViewer  from "../ImageViewer";


let HIDDEN_EVENTS = new Map([
  ["m.call.select_answer", true],
  ["m.call.candidates", true],
]); // these events won't be shown to the user.

let EVENT_STATUS_FOR_UPDATE = new Map([
  ["not_sent", true],
  ["sent", true],
  [null, true],
]); // if status for the sent event by user converts to any of these,
    // we won't go for re-render anymore.


function CannotSendMessage() {
  // eslint-disable-line no-unused-vars
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
  
  getVisibleEvents = () => {
    return this.timeline.getEvents().filter((evt) => evt.getType() && !HIDDEN_EVENTS.get(evt.getType()));
  };

  handleTyping = (_evt, member) => {
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
    const VALID_KEYS = ["b", "Backspace", "ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"];
    // Backspace is used on an actual device
    // b is used for testing in desktop browser
    if (!VALID_KEYS.includes(evt.key)) {
      return;
    }
    const { cursor, textInputFocus, message, waiting } = this.state;
    const { closeRoomView } = this.props;
    if (cursor <= 5 && !this.reachedEndOfTimeline) {
      let prev = this.getVisibleEvents().length - 1;
      window.mClient
        .paginateEventTimeline(this.timeline, { backwards: true, limit: 25 })
        .then((notReachedEnd) => {
          if (notReachedEnd) {
            const current = this.getVisibleEvents().length - 1;
            this.setState({
              cursor: current - prev,
            });
          } else {
            this.reachedEndOfTimeline = true;
          }
        });
    }

    if (this.state.imageViewer) {
      if (evt.key.startsWith("Arrow")) {
        let key = evt.key.replace("Arrow", "").toLowerCase();
        this.imageViewer.move(key);
      } else if (VALID_KEYS.slice(0, 2).includes(evt.key)) { // if it is backspace
        evt.preventDefault();
        this.setState({ imageViewer: false });
      }
      return;
    }
    const lastEventIndex = this.getVisibleEvents().lastIndex;
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
      if (waiting) {
        return;
      }
      if (textInputFocus) {
        this.setState({ textInputFocus: false, cursor: lastEventIndex });
      } else {
        this.setState({ cursor: Math.max(0, cursor - 1) });
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
      let events = this.getVisibleEvents();
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
  
  eventSentCb = (response) => {
    let evt = this.room.findEventById(response.event_id);
    let dis = this;
    function updateFn() {
      if (EVENT_STATUS_FOR_UPDATE.get(evt.status)) {
        dis.forceUpdate();
        evt.off("Event.status", updateFn);
      }
    }
    evt.on("Event.status", updateFn);
  };

  eventSentFailCb = (error) => {
    window.alert("Cannot sent message");
    console.log("ERROR", error);
  }

  getRightText = () => {
    const { imageViewer, textInputFocus } = this.state;
    if (imageViewer) {
      return "-";
    }
    if (!textInputFocus && this.currentEvent && this.currentEvent.status === "not_sent") {
      return "Delete";
    }
    return "";
  };

  getLeftText = () => {
    if (this.state.imageViewer) {
      return "+";
    }
    if (this.state.textInputFocus) return "+";
    const currentEvt = this.currentEvent;
    if (currentEvent) {
      if (currentEvt.status === "not_sent") {
        return "Retry";
      }
      let msgtype = currentEvt.getContent().msgtype;
      if (msgtype === "m.audio") return "Vol.";
      if (msgtype === "m.image") return "View";
    }
    return "";
  };
  

  leftCb = () => {
    if (this.getLeftText() === "+") {
      if (this.state.imageViewer) {
        this.imageViewer && this.imageViewer.zoomIn();
      } else {
        alert("Not implemented yet");
      }
    }
    if (this.getLeftText() === "Vol.") {
      navigator.volumeManager.requestShow();
    }
    if (this.getLeftText() === "View") {
      this.setState({ imageViewer: true }); 
    }
    if (this.getLeftText() === "Retry") {
      window.mClient.resendEvent(this.currentEvent).then(this.eventSentCb).catch(this.eventSentFailCb);
    }
  };
  
  rightCb = () => {
    if (this.state.imageViewer && this.imageViewer && this.getRightText() === "-") {
      this.imageViewer.zoomOut();
    }
    if (this.getRightText() === "Delete") {
      window.mClient.redactEvent(this.room.roomId, this.currentEvent.getId());
    }
  };

  centerCb = () => {
    const { message, isRecording } = this.state;
    const { roomId } = this.props;
    if (this.getCenterText() === "Reset") {
      this.imageViewer && this.imageViewer.resetZoom();
    }
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
        window.mClient.sendTextMessage(roomId, message).then(this.eventSentCb).catch(this.eventSentFailCb);
        this.setState({ message: "" });
        break;
      case "Download":
        let mxcUrl = this.currentEvent.getContent().url;
        if (!mxcUrl) {
          window.alert("Some error occured");
          console.log("REPORT", this.currentEvent);
          break;
        }
        fetch(mxcMediaToHttp(window.mClient.getHomeserverUrl(), mxcUrl)).then(
          (r) => {
            if (r.ok) {
              r.blob().then((b) => {
                let picStorage = navigator.getDeviceStorage("pictures");
                let req = picStorage.addNamed(
                  b,
                  this.currentEvent.getContent().body ||
                    "image." + extensionOf(b.type)
                );
                req.onsuccess = () => {
                  window.alert("Successfully saved the image to gallery");
                };
                req.onerror = () => {
                  window.alert(
                    "Cannot save the file to gallery. Perhaps there is no space left?"
                  );
                  console.log("REPORT", req.error, b);
                };
              });
            } else {
              window.alert("Some error occured during fetching the image");
            }
          }
        );
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
    const { isRecording, showMenu, textInputFocus, message, imageViewer } = this.state;
    if (imageViewer) {
      return "Reset";
    }
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
      else if (msgtype === "m.image") return "Download";
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
    this.imageViewer = null;
    this.reachedEndOfTimeline = false;
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
    const lastEventIndex = this.getVisibleEvents().length - 1;
    this.state = {
      showMenu: false,
      cursor: lastEventIndex,
      message: "",
      textInputFocus: true,
      isRecording: false,
      recordingSeconds: 0,
      waiting: false,
      imageViewer: false,
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
    const {
      isRecording,
      recordingSeconds,
      cursor,
      message,
      textInputFocus,
      typing,
      waiting,
      imageViewer,
    } = this.state;
    return (
      <>
        { imageViewer && this.currentEvent.getContent().msgtype === "m.image" ?
          <ImageViewer ref={(ref) => { this.imageViewer = ref; }} url={window.mClient.mxcUrlToHttp(this.currentEvent.getContent().url)} height={this.currentEvent.getContent().info.h} width={this.currentEvent.getContent().info.w} /> : null }
        <Header text={typing ? "Typing..." : this.room.name} />
        <div
          className="eventsandtextinput"
        >
          <div
            className={"kai-list-view"}
            style={{ height: "calc(100vh - 2.8rem - 40px - 32px)" }}
            ref={(r) => {
              this.r = r;
            }}
          >
            {waiting ? <Waiting /> : null}
            {this.getVisibleEvents().map((evt, index, arr) => {
              let item = <RoomEvent evt={evt} isFocused={index === cursor && !textInputFocus}/>;

              if (item.props.isFocused) {
                this.currentEvent = evt;
              }

              if (!item) {
                console.log("REPORT", item);
              }

              return (
                <ScrollIntoView shouldScroll={index === cursor}>
                  {item}
                </ScrollIntoView>
              );
            })}
          </div>
          {this.room.maySendMessage() ? (isRecording ? (
            <VoiceInput seconds={recordingSeconds} title={message} />
          ) : (
            <ChatTextInput
              message={message}
              onChangeCb={this.messageChangeCb}
              isFocused={textInputFocus}
            />
          )) : (<CannotSendMessage />)}
        </div>
        <footer>
          <SoftKey
            centerText={this.getCenterText()}
            centerCb={this.centerCb}
            leftText={this.getLeftText()}
            leftCb={this.leftCb}
            rightCb={this.rightCb}
            rightText={this.getRightText()}
          />
        </footer>
      </>
    );
  }
}

export default RoomView;
