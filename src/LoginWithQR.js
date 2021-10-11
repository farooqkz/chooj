import { Component } from "inferno";

import "./LoginWithQR.css";
import SoftKey from "./ui/SoftKey";

class LoginWithQR extends Component {
  constructor(props) {
    super(props);
    this.video = null;
    this.state = {};
  }

  componentDidMount() {
    window.navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: "environment" },
      })
      .then((stream) => {
        this.video.srcObject = stream;
      });
  }

  render() {
    return (
      <>
        <div className="videodiv">
          <video
            autoplay
            ref={(ref) => {
              this.video = ref;
            }}
          />
        </div>
        <SoftKey centerText="Scan" centerCb={this.takePhoto} />
      </>
    );
  }
}

export default LoginWithQR;
