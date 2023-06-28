import { Component } from "inferno";
import { extensionOf } from "xmimetype";
import { Header, SoftKey } from "KaiUI";
import {
  MatrixEvent,
  EventTimeline,
  RoomMember,
  RoomMemberEvent,
  Room,
  ISendEventResponse,
  RoomEvent as SDKRoomEvent,
  UploadResponse,
  MatrixEventEvent,
} from "matrix-js-sdk";
import { isDM, isRoom, updateState, mxcMediaToHttp } from "../utils";
import ChatTextInput from "../ChatTextInput";
import VoiceInput from "../VoiceInput";
import ScrollIntoView from "./ScrollIntoView";
import "./RoomView.css";
import RoomEvent from "./RoomEvent";
import ImageViewer  from "../ImageViewer";
import shared from "../shared";
import { RoomsViewState } from "../types";
import "./CannotSendMessage.css";


let HIDDEN_EVENTS: Map<string, boolean> = new Map([
  ["m.call.select_answer", true],
  ["m.call.candidates", true],
]); // these events won't be shown to the user.

let EVENT_STATUS_FOR_UPDATE: Map<string | null, boolean> = new Map([
  ["not_sent", true],
  ["sent", true],
  [null, true],
]); // if status for the sent event by user converts to any of these,
    // we won't go for re-render anymore.


function CannotSendMessage() {
  return (
    <div className="cannotsendmessage">
      <p>Cannot send message to this room</p>
    </div>
  );
}


interface RoomViewState {
  isRecording: boolean;
  showMenu: boolean;
  cursor: number;
  message: string;
  textInputFocus: boolean;
  recordingSeconds: number;
  imageViewer: boolean;
  typing: boolean;
}

interface RoomViewProps {
  roomId: string;
  closeRoomView: () => void;
}

class RoomView extends Component<RoomViewProps, RoomViewState> {
  public state: RoomViewState;
  private timeline: EventTimeline;
  private room: Room;
  private dm: boolean;
  private currentEvent: MatrixEvent | undefined;
  private recorder: MediaRecorder | null;
  private reachedEndOfTimeline: boolean;
  private recordingInterval: number;
  private recording: Blob[];
  private imageViewer: ImageViewer | null;
  
  getCurrentEvent = () => {
    if (!this.currentEvent) {
      throw new Error("currentEvent is undefined");
    }
    return this.currentEvent;
  }

  messageChangeCb = (message: string) => {
    this.setState({ message: message });
    shared.mClient && shared.mClient.sendTyping(this.room.roomId, true, 75);
  };
  
  getVisibleEvents = () => {
    return this.timeline.getEvents().filter((evt: MatrixEvent) => evt.getType() && !HIDDEN_EVENTS.get(evt.getType()));
  };

  handleTyping = (_evt: MatrixEvent, member: RoomMember) => {
    if (member.roomId !== this.room.roomId) {
      return;
    }
    if (!this.dm) {
      // currently there is no typing notif for non DM rooms
      return;
    }
    if (shared.mClient && shared.mClient.getUserId() === member.userId) {
      return;
    }
    this.setState({ typing: Boolean(member.typing) });
  };

  handleKeyDown = (evt: KeyboardEvent) => {
    const VALID_KEYS = ["b", "Backspace", "ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"];
    // Backspace is used on an actual device
    // b is used for testing in desktop browser
    if (!VALID_KEYS.includes(evt.key)) {
      return;
    }
    const { cursor, textInputFocus, message } = this.state;
    const { closeRoomView } = this.props;
    if (cursor <= 15 && !this.reachedEndOfTimeline) {
      let prev = this.getVisibleEvents().length - 1;
      shared.mClient
        .paginateEventTimeline(this.timeline, { backwards: true, limit: 25 })
        .then((notReachedEnd: boolean) => {
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
      if (!this.imageViewer) {
        alert("Image viewer is null! This is a bug. please report it :)");
        return;
      }
      if (evt.key.startsWith("Arrow")) {
        let key = evt.key.replace("Arrow", "").toLowerCase();
        this.imageViewer.move(key);
      } else if (VALID_KEYS.slice(0, 2).includes(evt.key)) { // if it is backspace
        evt.preventDefault();
        this.setState({ imageViewer: false });
      }
      return;
    }
    const lastEventIndex = this.getVisibleEvents().length - 1;
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
      if (textInputFocus) {
        this.setState({ textInputFocus: false, cursor: lastEventIndex });
      } else {
        this.setState({ cursor: Math.max(0, cursor - 1) });
      }
    }
  };

  handleTimelineUpdate = (evt: MatrixEvent, room: Room | undefined) => {
    if (!room) {
      return;
    }
    if (isRoom(room)) {
      let roomsViewState: RoomsViewState | undefined = shared.stateStores.get("RoomsView");
      if (roomsViewState) {
        roomsViewState = updateState(room, roomsViewState);
        shared.stateStores.set("RoomsView", roomsViewState);
      }
    }
    if (isDM(room)) {
      let dmsViewState: RoomsViewState | undefined = shared.stateStores.get("DMsView");
      if (dmsViewState) {
        dmsViewState = updateState(room, dmsViewState);
        shared.stateStores.set("DMsView", dmsViewState);
      }
    }
    if (room.roomId === this.room.roomId) {
      let events = this.getVisibleEvents();
      const lastEventIndex = events.length - 1;
      const { cursor, textInputFocus } = this.state;
      if (textInputFocus) {
        // partial support
        shared.mClient.sendReadReceipt(evt);
      }
      this.setState({
        cursor: textInputFocus ? lastEventIndex : cursor,
      });
    }
  };
  
  eventSentCb = (response: ISendEventResponse) => {
    let evt: MatrixEvent | undefined = this.room.findEventById(response.event_id);
    if (!evt) {
      return;
    }
    let dis = this;
    function updateFn() {
      if (!evt) {
        return;
      }
      if (EVENT_STATUS_FOR_UPDATE.get(evt.status)) {
        dis.forceUpdate();
        evt.off(MatrixEventEvent.Status, updateFn);
      }
    }
    evt.on(MatrixEventEvent.Status, updateFn);
  };

  eventSentFailCb = (error: any) => {
    window.alert("Cannot sent message");
    console.log("ERROR", error);
  }

  getRightText = () => {
    const { imageViewer, textInputFocus } = this.state;
    if (imageViewer) {
      return "-";
    }
    if (!textInputFocus && this.getCurrentEvent().status === "not_sent") {
      return "Delete";
    }
    return "";
  };

  getLeftText = () => {
    if (this.state.imageViewer) {
      return "+";
    }
    if (this.state.textInputFocus) return "+";
    let currentEvt: MatrixEvent = this.getCurrentEvent();
    if (currentEvt.status === "not_sent") {
      return "Retry";
    }
    let msgtype = currentEvt.getContent().msgtype;
    if (msgtype === "m.audio") return "Vol.";
    if (msgtype === "m.image") return "View";
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
      shared.mClient.resendEvent(this.getCurrentEvent(), this.room).then(this.eventSentCb).catch(this.eventSentFailCb);
    }
  };
  
  rightCb = () => {
    if (this.state.imageViewer && this.imageViewer && this.getRightText() === "-") {
      this.imageViewer.zoomOut();
    }
    if (this.getRightText() === "Delete") {
      let currentEvent: MatrixEvent = this.getCurrentEvent();
      let evtId: string | undefined = currentEvent.getId();
      if (evtId) {
        shared.mClient.redactEvent(this.room.roomId, evtId);
      } else {
        throw new Error("Cannot get current event ID");
      }
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
        let audio: HTMLAudioElement | null = document.querySelector(".ircmsg--focused>p>audio");
        if (!audio) {
          alert("Cannot find the audio. This is probably a bug. Please report it.");
          return;
        }
        audio.play();
        break;
      case "Send":
        if (isRecording) {
          if (!this.recorder) {
            alert("recorder is null. This is probably a bug. Please report it.");
            return;
          }
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
        shared.mClient.sendTextMessage(roomId, message).then(this.eventSentCb).catch(this.eventSentFailCb);
        this.setState({ message: "" });
        break;
      case "Download":
        let mxcUrl = this.getCurrentEvent().getContent().url;
        if (!mxcUrl) {
          window.alert("Some error occured");
          console.log("REPORT", this.getCurrentEvent());
          break;
        }
        fetch(mxcMediaToHttp(shared.mClient.getHomeserverUrl(), mxcUrl)).then(
          (r: Response) => {
            if (r.ok) {
              r.blob().then((b: Blob) => {
                let picStorage = navigator.getDeviceStorage("pictures");
                let req = picStorage.addNamed(
                  b,
                  this.getCurrentEvent().getContent().body ||
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
        if (!this.recorder) {
          alert("recorder is null. This is probably a bug. Please report it.");
          return;
        }
        this.recorder.start();
        this.recordingInterval = setInterval(() => {
          this.setState((state: RoomViewState) => {
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
    const currentEvt = this.getCurrentEvent();
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
    return "";
  };

  constructor(props: any) {
    super(props);
    console.log("DIS", this);
    let room = shared.mClient.getRoom(props.roomId);
    if (!room) {
      throw new Error(`Cannot find room with this roomId: ${props.roomId}`);
    }
    this.room = room;
    this.dm = isDM(this.room);
    this.currentEvent = room.getLastLiveEvent();
    this.timeline = this.room.getLiveTimeline();
    this.recorder = null;
    this.recording = new Array();
    this.imageViewer = null;
    this.reachedEndOfTimeline = false;
    this.recordingInterval = 0;
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      this.recorder = new MediaRecorder(stream);
      this.recorder.ondataavailable = (evt: BlobEvent) => {
        this.recording.push(evt.data);
      };
      this.recorder.onstop = () => {
        let blob = new Blob(this.recording);
        let size = blob.size;
        let duration = Math.floor(this.state.recordingSeconds * 1000);
        let mimetype = blob.type;
        shared.mClient
          .uploadContent(blob, {
            type: mimetype,
          })
          .then((response: UploadResponse) => {
            const mxcUrl: string = response.content_uri;
            const roomId: string = this.props.roomId;
            shared.mClient
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
              .catch((err: any) => console.log(err));
          })
          .catch(() => alert("Cannot send voice"));
      };
    });
    const lastEventIndex = this.timeline.getEvents().length - 1;
    this.state = {
      showMenu: false,
      cursor: lastEventIndex,
      message: "",
      textInputFocus: true,
      isRecording: false,
      recordingSeconds: 0,
      imageViewer: false,
      typing: false,
    };
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
    shared.mClient && shared.mClient.addListener(SDKRoomEvent.Timeline, this.handleTimelineUpdate);
    shared.mClient && shared.mClient.addListener(RoomMemberEvent.Typing, this.handleTyping);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
    shared.mClient && shared.mClient.removeListener(SDKRoomEvent.Timeline, this.handleTimelineUpdate);
    shared.mClient && shared.mClient.removeListener(RoomMemberEvent.Typing, this.handleTyping);
  }

  render() {
    const {
      isRecording,
      recordingSeconds,
      cursor,
      message,
      textInputFocus,
      typing,
      imageViewer,
    } = this.state;
    return (
      <>
        { imageViewer && this.getCurrentEvent().getContent().msgtype === "m.image" ?
          <ImageViewer ref={(ref) => { this.imageViewer = ref; }} url={shared.mClient.mxcUrlToHttp(this.getCurrentEvent().getContent().url)} height={this.getCurrentEvent().getContent().info.h} width={this.getCurrentEvent().getContent().info.w} /> : null }
        <Header text={typing ? "Typing..." : this.room.name} />
        <div
          className="eventsandtextinput"
        >
          <div
            className={"kai-list-view"}
            style={{ height: "calc(100vh - 2.8rem - 40px - 32px)" }}
            $HasKeyedChildren
          >
            {this.getVisibleEvents().map((evt: MatrixEvent, index: number) => {
              let item = <RoomEvent key={evt.getId()} evt={evt} isFocused={index === cursor && !textInputFocus}/>;

              if (item && item.props && item.props.isFocused) {
                this.currentEvent = evt;
              }

              if (!item) {
                console.log("REPORT", item);
              }

              return (
                <ScrollIntoView shouldScroll={index === cursor} key={evt.getId()}>
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
