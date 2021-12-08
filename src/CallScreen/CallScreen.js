import { Component } from "inferno";
import "./CallScreen.css";
import SoftKey from "../ui/SoftKey";
import waitingRing from "./waiting.ogg";
import incomingRing from "./incoming.ogg";

const personIcon = "/person_icon.png";

function readableDuration(duration) {
  if (!duration) return "--";
  return duration.toString() + "s";
}

class CallScreen extends Component {
  handleKeyDown = (evt) => {
    if (evt.key === "b" || evt.key === "Backspace") {
      evt.preventDefault();
      this.call.hangup();
    }
    if (evt.key === "Call" || evt.key === "c") {
      this.call.answer();
    }
  };

  constructor(props) {
    super(props);
    console.log("CS", props);
    const { type, call, roomId } = props;
    const baseUrl = window.mClient.baseUrl;
    const AVATAR_D = 64;
    this.call = call || null;
    this.timer = null;
    this.waitingRing = null;
    this.incomingRing = null;
    this.callAudios = null;
    if (type === "voice") {
      // A voice call must be placed
      this.call = window.mClient.createCall(roomId);
      this.call.placeVoiceCall();
    } else if (type === "incoming") {
      this.props.displayName = this.call.getOpponentMember().name;
      this.props.avatar = this.call
        .getOpponentMember()
        .getAvatarUrl(baseUrl, AVATAR_D, "scale");
    } else {
      throw new Error("Invalid call type");
    }
    this.call.on("feeds_changed", (feeds) => {
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
    this.call.on("error", (error) => {
      console.error("CALL ERROR", error);
      this.call.hangup();
    });
    this.call.on("hangup", () => {
      this.callAudios.map((audio) => audio.pause());
      if (this.waitingRing) this.waitingRing.pause();
      if (this.incomingRing) this.incomingRing.pause();
      window.clearInterval(this.timer);
      this.props.endOfCallCb();
    });
    this.call.on("state", (newCallState) => {
      if (["voice", "video"].includes(this.props.type)) {
        if (newCallState === "invite_sent") {
          this.waitingRing = new Audio(waitingRing);
          this.waitingRing.loop = true;
          this.waitingRing.mozAudioChannelType = "telephony";
          this.waitingRing.play();
        }
        if (newCallState === "connected") {
          this.waitingRing.pause();
          this.waitingRing = null;
        }
      }
      if (newCallState === "connected") {
        this.timer = window.setInterval(() => {
          this.setState((prevState) => {
            prevState.duration++;
            return prevState;
          });
        }, 1000);
        this.setState({ hasStarted: true });
      }
      if (this.props.type === "incoming") {
        console.log("CS", newCallState);
        if (newCallState === "ended") {
          this.call.hangup();
        }
        if (newCallState === "connected") {
          this.incomingRing.pause();
          this.incomingRing = null;
        }
        if (newCallState === "ringing") {
          this.incomingRing = new Audio(incomingRing);
          this.incomingRing.mozAudioChannelType = "ringer";
          this.incomingRing.play();
        }
      }
    });

    this.state = {
      duration: 0,
      hasStarted: false,
      isAudioMuted: false,
    };
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
