import "./CallScreen.css";
import personIcon from "../person_icon.png";

function CallScreen(props) {
  return (
    <div className="callscreendiv">
      <img src={this.props.avatar || personIcon} alt="avatar" />
      <h3 $HasTextChildren>{this.props.userId}</h3>
      <h4 $HasTextChildren>{this.props.callState || ""}</h4>
    </div>
  );
}

export default CallScreen;
