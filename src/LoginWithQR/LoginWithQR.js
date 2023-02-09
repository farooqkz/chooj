import { Component } from "inferno";
import jsQR from "jsqr";
import * as matrixcs from "matrix-js-sdk";
import * as localforage from "localforage";

import "./LoginWithQR.css";
import SoftKey from "../ui/SoftKey";

class LoginWithQR extends Component {
  takePhoto = () => {
    let canvas = document.createElement("canvas");
    let context2D = canvas.getContext("2d");
    const videoWidth = this.video.videoWidth;
    const videoHeight = this.video.videoHeight;
    canvas.height = videoHeight;
    canvas.width = videoWidth;
    context2D.drawImage(this.video, 0, 0, videoWidth, videoHeight);
    let data = context2D.getImageData(0, 0, videoWidth, videoHeight).data;
    let decoded = jsQR(data, videoWidth, videoHeight, {
      inversionAttempts: "dontInvert",
    });
    if (decoded === null) {
      window.alert("Scanned nothing... Please retry!");
      return;
    } else {
      decoded = decoded.data;
    }
    data = decoded.split(" ", 4);
    const flow = data[0];
    const server_name = data[1];
    const username = data[3];
    let password = null;
    if (
      window.confirm(
        `Do you confirm? Flow: ${flow} | Server name: ${server_name} | Username: ${username}`
      )
    ) {
      const start = flow.length + server_name.length + username.length + 3;
      password = decoded.substring(start + 1);
      fetch(`https://${server_name}/.well-known/matrix/server`).then((r) => {
        if (r.ok) {
          r.json().then((j) => {
            const server_url = j["m.server"];
            window.mClient = matrixcs.createClient({
              baseUrl: server_url,
            });
            window.mClient.loginFlows().then((result) => {
              let gotPasswordLogin = false;
              for (let flow of result.flows) {
                if ("m.login.password" === flow.type) {
                  gotPasswordLogin = true;
                  break;
                }
              }
              if (gotPasswordLogin) {
                window.mClient
                  .loginWithPassword(`@${username}:${server_name}`, password)
                  .then((result) => {
                    localforage.setItem("login", result).then(() => {
                      window.alert("Logged in as " + username);
                      // eslint-disable-next-line no-self-assign
                      window.location = window.location;
                    });
                  })
                  .catch((err) => {
                    switch (err.errcode) {
                      case "M_FORBIDDEN":
                        alert("Incorrect login credentials");
                        break;
                      case "M_USER_DEACTIVATED":
                        alert("This account has been deactivated");
                        break;
                      case "M_LIMIT_EXCEEDED":
                        const retry = Math.ceil(err.retry_after_ms / 1000);
                        alert(
                          "Too many requests! Retry after" + retry.toString()
                        );
                        break;
                      default:
                        alert("Login failed! Unknown reason");
                        break;
                    }
                    // eslint-disable-next-line no-self-assign
                    window.location = window.location;
                  });
              } else {
                window.alert(
                  "This homeserver does not support authentication with password"
                );
              }
            });
          });
        } else {
          alert(
            "Cannot connect to homeserver. Are you sure the address is correct?"
          );
        }
      });
    }
  };

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
