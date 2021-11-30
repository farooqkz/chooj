import { createTextVNode } from "inferno";
import "./CallScreen.css";
import personIcon from "../person_icon.png";

function CallScreen(props) {
  return (
    <div className="callscreendiv">
      <img src={this.props.avatar || personIcon} alt="avatar" />
      <h3 $HasVNodeChildren>{createTextVNode(this.props.userId)}</h3>
      <h4 $HasVNodeChildren>{createTextVNode(this.props.callState || "")}</h4>
    </div>
  );
}

export default CallScreen;
