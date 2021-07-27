import { Component } from "inferno";
import personIcon from "./person_icon.png";

class CallScreen extends Component {
  render() {
    return (
      <div
        style={{
          height: "100%",
          width: "100%",
          "background-color": "rgba(183, 82, 100, 0.75)",
          display: "flex",
          "justify-content": "center",
        }}
      >
        <img
          style={{ height: "64px", width: "64px", "border-radius": "25%" }}
          src={this.props.avatar || personIcon}
          alt="avatar"
        />
        <h3>{this.props.userId}</h3>
        <h4>{this.props.state}</h4>
      </div>
    );
  }
}

export default CallScreen;
