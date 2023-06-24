import { Component } from "inferno";
import jsQR, { QRCode } from "jsqr";
import { createClient } from "matrix-js-sdk";
import * as localforage from "localforage";

import "./LoginWithQR.css";
import { SoftKey } from "KaiUI";


interface WellKnown {
  "m.server": string;
}

class LoginWithQR extends Component<{}, {}> {
  private video?: HTMLVideoElement;
  private takePhoto: () => void;

  takePhoto = () => {
    let canvas = document.createElement("canvas");
    let context2D: CanvasRenderingContext2D | null = canvas.getContext("2d");
    if (!this.video || !context2D)  {
      return;
    }
    const videoWidth = this.video.videoWidth;
    const videoHeight = this.video.videoHeight;
    canvas.height = videoHeight;
    canvas.width = videoWidth;
    context2D.drawImage(this.video, 0, 0, videoWidth, videoHeight);
    let data: Uint8ClampedArray = context2D.getImageData(0, 0, videoWidth, videoHeight).data;
    let decodedQR: QRCode | null = jsQR(data, videoWidth, videoHeight, {
      inversionAttempts: "dontInvert",
    });
    let decoded: string;
    if (decodedQR === null) {
      window.alert("Scanned nothing... Please retry!");
      return;
    } else {
      decoded = decodedQR.data;
    }
    let decodedParts: Array<string> = decoded.split(" ", 4);
    const flow = decodedParts[0];
    const server_name = decodedParts[1];
    const username = decodedParts[2];
    let password: string;
    if (
      window.confirm(
        `Do you confirm? Flow: ${flow} | Server name: ${server_name} | Username: ${username}`
      )
    ) {
      const start: number = flow.length + server_name.length + username.length + 3;
      password = decoded.substring(start);
      fetch(`https://${server_name}/.well-known/matrix/server`).then((r: Response) => {
        if (r.ok) {
          r.json().then((j: WellKnown) => {
            const server_url: string = j["m.server"];
            window.mClient = createClient({
              baseUrl: `https://${server_url}`,
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
                  .then((result: any) => {
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
            }).catch((e) => {
              window.alert("Error getting login flows from the server");
              console.log(e);
            });
          }).catch((e) => {
            window.alert("Error getting information about the server");
            console.log("REPORT", e);
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
    this.state = null;
  }

  componentDidMount() {
    window.navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: "environment" },
      })
      .then((stream) => {
        if (this.video)
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
              if (ref)
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
