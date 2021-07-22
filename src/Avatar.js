import { Component } from "inferno";

const presenceColor = {
  online: "green",
  offline: "gray",
  unavailable: "orange",
};

class Avatar extends Component {
  render() {
    return (
      <div style={{ width: "36px", height: "36px", position: "relative" }}>
        <img
          style={{ width: "100%", height: "100%", "border-radius": "50%" }}
          src={this.props.avatar}
          alt=""
        />
        <div
          style={{
            width: "12px",
            height: "12px",
            "border-radius": "50%",
            "background-color": presenceColor[this.props.online],
            border: "2px solid white",
            bottom: 0,
            right: "-12px",
            position: "absolute",
          }}
        ></div>
      </div>
    );
  }
}

export default Avatar;
