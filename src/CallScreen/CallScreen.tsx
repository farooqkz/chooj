import { Component } from "inferno";
import "./CallScreen.css";
import { SoftKey } from "KaiUI";
import { MatrixCall, RoomMember } from "matrix-js-sdk";
import waitingRing from "url:./waiting.ogg";
import incomingRing from "url:./incoming.ogg";
import { CallEvent, CallErrorCode } from "matrix-js-sdk/src/webrtc/call";
import shared from "../shared";

const personIcon = "/person_icon.png";

function readableDuration(duration?: number) : String {
  if (!duration) return "--";
  return duration.toString() + "s";
}


interface CallScreenState {
  duration: number;
  hasStarted: boolean;
  isAudioMuted: boolean;
}

interface CallProps {
  type: string;
  roomId?: string;
  userId?: string;
}

interface CallScreenProps {
  endOfCallCb: () => void;
  call: MatrixCall;
  callProps: CallProps;
}

class CallScreen extends Component<CallScreenProps, CallScreenState> {
  public state: CallScreenState = {
    duration: 0,
    hasStarted: false,
    isAudioMuted: false,
  }
  public call?: MatrixCall;
  public waitingRing?: HTMLAudioElement;
  public incomingRing?: HTMLAudioElement;
  public callAudios: HTMLAudioElement[] = [];
  public timer?: number;
  public avatarUrl: string | null = null;
  public displayName?: string;

  handleKeyDown = (evt: KeyboardEvent) => {
    if (evt.key === "b" || evt.key === "Backspace") {
      evt.preventDefault();
      this.call && this.call.hangup(CallErrorCode.UserHangup, true);
    }
    if (evt.key === "Call" || evt.key === "c") {
      this.call && this.call.answer();
    }
  };

  constructor(props: any) {
    super(props);
    console.log("CS", props);
    const { callProps, call, roomId } = props;
    const baseUrl = shared.mClient.baseUrl;
    const AVATAR_D = 64;
    this.call = call || null;
    if (callProps.type === "voice") {
      // A voice call must be placed
      let call: MatrixCall | null = shared.mClient.createCall(roomId);
      if (!call) {
        alert("Your device does not support calling");
        return;
      }
      this.call = call;
      this.call.placeVoiceCall();
    } else if (callProps.type === "incoming") {
      if (!this.call) {
        throw new Error("call is null");
      }
      let opponent: RoomMember | undefined = this.call.getOpponentMember();
      if (opponent) {
        this.displayName = opponent.name;
        this.avatarUrl = opponent.getAvatarUrl(baseUrl, AVATAR_D, AVATAR_D, "scale", true, false);
      }
    } else {
      throw new Error("Invalid call type");
    }
    if (!this.call) {
      throw new Error("call is null");
    }
    this.call.on(CallEvent.FeedsChanged, (feeds) => {
      this.callAudios = feeds
        .filter((feed) => !feed.isLocal())
        .map((feed) => {
          let audio = new Audio();
          audio.srcObject = feed.stream;
          audio.mozAudioChannelType = "telephony";
          audio.play();
          return audio;
        });
    });
    this.call.on(CallEvent.Error, (error: any) => {
      console.error("CALL ERROR", error);
      this.call && this.call.hangup(CallErrorCode.UserHangup, true);
    });
    this.call.on(CallEvent.Hangup, () => {
      this.callAudios.map((audio) => audio.pause());
      if (this.waitingRing) this.waitingRing.pause();
      if (this.incomingRing) this.incomingRing.pause();
      window.clearInterval(this.timer);
      this.props.endOfCallCb();
    });
    this.call.on(CallEvent.State, (newCallState) => {
      if (["voice", "video"].includes(this.props.type)) {
        if (newCallState === "invite_sent") {
          this.waitingRing = new Audio(waitingRing);
          this.waitingRing.loop = true;
          this.waitingRing.mozAudioChannelType = "telephony";
          this.waitingRing.play();
        }
        if (newCallState === "connected") {
          this.waitingRing?.pause();
          this.waitingRing = undefined;
        }
      }
      if (newCallState === "connected") {
        this.timer = window.setInterval(() => {
          this.setState((prevState: CallScreenState) => {
            prevState.duration++;
            return prevState;
          });
        }, 1000);
        this.setState({ hasStarted: true });
      }
      if (this.props.callProps.type === "incoming") {
        console.log("CS", newCallState);
        if (newCallState === "ended") {
          this.call && this.call.hangup(CallErrorCode.UserHangup, true);
        }
        if (newCallState === "connected") {
          this.incomingRing?.pause();
          this.incomingRing = undefined;
        }
        if (newCallState === "ringing") {
          this.incomingRing = new Audio(incomingRing);
          this.incomingRing.mozAudioChannelType = "ringer";
          this.incomingRing.play();
        }
      }
    });
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  render() {
    const { displayName, avatar } = this.props;
    const { duration, hasStarted, isAudioMuted } = this.state;
    return (
      <div className="callscreendiv">
        <div className="callscreen-content">
          <img src={avatar || personIcon} alt="" />
          <p style={{ "font-size": "6vh" }} $HasTextChildren>
            {displayName}
          </p>
          <p style={{ "font-size": "4vh" }} $HasTextChildren>
            {readableDuration(duration)}
          </p>
        </div>
        <SoftKey
          centerCb={() => {
            if (hasStarted) {
              const newMuteState = !isAudioMuted;
              this.call.setMicrophoneMuted(newMuteState);
              this.setState({ isAudioMuted: newMuteState });
            } else {
              this.call.answer(true); // answer with only audio enabled
            }
          }}
          centerText={
            hasStarted ? (isAudioMuted ? "Unmute" : "Mute") : "Answer"
          }
        />
      </div>
    );
  }
}
export default CallScreen;
