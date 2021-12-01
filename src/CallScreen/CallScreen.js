import "./CallScreen.css";
import personIcon from "../person_icon.png";

function CallScreen({ avatar, callState, userId }) {
  return (
    <div className="callscreendiv">
      <img src={avatar || personIcon} alt="avatar" />
      <h3 $HasTextChildren>{userId}</h3>
      <h4 $HasTextChildren>{callState || ""}</h4>
    </div>
  );
}

export default CallScreen;
