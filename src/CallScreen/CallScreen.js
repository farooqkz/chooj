import "./CallScreen.css";
import personIcon from "../person_icon.png";
import SoftKey from "../ui/SoftKey";

function CallScreen({ avatar, call, userId }) {
  return (
    <div className="callscreendiv">
      <div className="callscreen-content">
        <img src={avatar || personIcon} alt="" />
        <p style={{ "font-size": "6vh" }} $HasTextChildren>{userId}</p>
        <p style={{ "font-size": "4vh" }} $HasTextChildren>{"callState here"}</p>
      </div>
      <SoftKey
        centerCb={() => {
          call.setMicrophoneMuted(
            !call.getLocalFeeds()[0].isAudioMuted()
          );
        }}
        //centerText={call.getLocalFeeds()[0].isAudioMuted()? "Unmute" : "Mute"}
        centerText="Toggle mute"
      />
    </div>
  );
}

export default CallScreen;
