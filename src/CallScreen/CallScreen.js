import "./CallScreen.css";
import personIcon from "../person_icon.png";
import SoftKey from "../ui/SoftKey";

function CallScreen({ avatar, call, userId }) {
  return (
    <div className="callscreendiv">
      <img src={avatar || personIcon} alt="" />
      <h3 $HasTextChildren>{userId}</h3>
      <h4 $HasTextChildren>{"callState "}</h4>
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
