import { Component } from "inferno";
import QrScanner from "qr-scanner";
import { LoginFlow } from "matrix-js-sdk/lib/@types/auth";

import "./LoginWithQR.css";
import { SoftKey } from "KaiUI";
import LoginHandler from "../LoginHandler";

interface LoginWithQRProps {
  loginHandler: LoginHandler;
}

class LoginWithQR extends Component<LoginWithQRProps, {}> {
  private video?: HTMLVideoElement;
  private loginHandler: LoginHandler;

  startScanning = () => {
    if (!this.video) {
      return;
    }
    let scanner: QrScanner = new QrScanner(
      this.video,
      (result: QrScanner.ScanResult) => this.doLogin(result.data),
      {
        maxScansPerSecond: 10,
        highlightScanRegion: true,
      }
    );
    scanner.start();
  };

  private login_flows_short: {[key: string]: string} = {
    "PASS": "m.login.password"
  }

  private async doLogin (data: string) {
    let decodedParts: string[] = data.split(" ", 4);
    let flow = decodedParts[0];
    const server_name = decodedParts[1];
    const username = decodedParts[2];
    const start = flow.length + server_name.length + username.length + 3;
    let password: string = data.substring(start);
    // TODO implement more flows
    if (window.confirm(
        `Do you confirm? Flow: ${flow} | Server name: ${server_name} | Username: ${username}`)) {
      // users can either write the full m.login.password (or whatever other flow) or use a shorthand
      // This maps the shorthand to the actual flow identificator
      if (!flow.startsWith("m.login")) {
        flow = this.login_flows_short[flow];
      }
      if (flow !== "m.login.password") {
        alert("Password authentication is the only supported flow currently")
        return;
      }
      try {
        await this.loginHandler.findHomeserver(server_name);
        let selected_flow: LoginFlow | undefined;
        for (let available_flow of this.loginHandler.loginFlows) {
          if (available_flow.type === flow) {
            selected_flow = available_flow;
          }
        }
        if (selected_flow !== undefined) {
          let loginData = {'username': username, 'password': password};
          await this.loginHandler.doLogin(selected_flow, loginData); 
          window.location = window.location;
        }
      } catch (e) {
        alert(e)
      }
    }
  };

  constructor(props: any) {
    super(props);
    this.state = null;
    this.loginHandler = props.loginHandler;
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
              if (ref) this.video = ref;
            }}
          />
        </div>
        <SoftKey />
      </>
    );
  }
}

export default LoginWithQR;
