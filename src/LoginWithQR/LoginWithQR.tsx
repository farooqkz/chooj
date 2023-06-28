import { Component } from "inferno";
import QrScanner from "qr-scanner";
import { createClient } from "matrix-js-sdk";
import { ILoginFlowsResponse } from "matrix-js-sdk/src/@types/auth";
import * as localforage from "localforage";

import "./LoginWithQR.css";
import { SoftKey } from "KaiUI";
import shared from "../shared";


interface WellKnown {
  "m.homeserver": Server;
  "m.identity_server": Server | undefined;
}

interface Server {
  base_url: string;
}

class LoginWithQR extends Component<{}, {}> {
  private video?: HTMLVideoElement;

  startScanning = () => {
    if (!this.video)  {
      return;
    }
    let scanner: QrScanner = new QrScanner(this.video, (result: QrScanner.ScanResult) => this.doLogin(result.data),
        {
      maxScansPerSecond: 10,
      highlightScanRegion: true,
    });
    scanner.start();
  }

  doLogin = (data: string) => {
    let decodedParts: Array<string> = data.split(" ", 4);
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
      password = data.substring(start);
      fetch(`https://${server_name}/.well-known/matrix/client`).then((r: Response) => {
        if (r.ok) {
          r.json().then((j: WellKnown) => {
            const server_url: string = j["m.homeserver"].base_url;
            shared.mClient = createClient({
              baseUrl: server_url,
            });
            shared.mClient.loginFlows().then((result: ILoginFlowsResponse) => {
              let gotPasswordLogin = false;
              for (let flow of result.flows) {
                if ("m.login.password" === flow.type) {
                  gotPasswordLogin = true;
                  break;
                }
              }
              if (gotPasswordLogin) {
                shared.mClient
                  .loginWithPassword(`@${username}:${server_name}`, password)
                  .then((result: any) => {
                    localforage.setItem("login", result).then(() => {
                      window.alert("Logged in as " + username);
                      window.location = window.location;
                    });
                  })
                  .catch((err: any) => {
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

  constructor(props: any) {
    super(props);
    this.state = null;
  }

  componentDidMount() {
    window.navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: "environment" },
      })
      .then((stream) => {
        if (this.video) {
          this.video.srcObject = stream;
          this.startScanning();
        }
      });
  }

  render() {
    return (
      <>
        <div className="videodiv">
          <video
            autoPlay
            ref={(ref) => {
              if (ref)
                this.video = ref;
            }}
          />
        </div>
        <SoftKey />
      </>
    );
  }
}

export default LoginWithQR;
