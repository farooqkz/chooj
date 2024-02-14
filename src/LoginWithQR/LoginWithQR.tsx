import { Component } from "inferno";
import QrScanner from "qr-scanner";
import { LoginFlow } from "matrix-js-sdk/lib/@types/auth";

import "./LoginWithQR.css";
import { SoftKey } from "KaiUI";
import LoginHandler, { LoginData } from "../LoginHandler";

interface LoginWithQRProps {
  loginHandler: LoginHandler;
}

class LoginWithQR extends Component<LoginWithQRProps, null> {
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

  private readonly loginFlowsShort: Record<string, string> = {
    "PASS": "m.login.password"
  }

  private async doLogin (data: string) {
    let decodedParts: string[] = data.split(" ", 4);
    let flow = decodedParts[0];
    const serverName = decodedParts[1];
    const username = decodedParts[2];
    const start = flow.length + serverName.length + username.length + 3;
    let password: string = data.substring(start);
    // TODO implement more flows
    if (window.confirm(
        `Do you confirm? Flow: ${flow} | Server name: ${serverName} | Username: ${username}`)) {
      // users can either write the full m.login.password (or whatever other flow) or use a shorthand
      // This maps the shorthand to the actual flow identificator
      if (!flow.startsWith("m.login")) {
        flow = this.loginFlowsShort[flow];
      }
      if (flow !== "m.login.password") {
        alert("Password authentication is the only supported flow currently")
        return;
      }
      try {
        await this.loginHandler.findHomeserver(serverName);
        let selectedFlow: LoginFlow | undefined;
        for (let availableFlow of this.loginHandler.loginFlows) {
          if (availableFlow.type === flow) {
            selectedFlow = availableFlow;
          }
        }
        if (selectedFlow !== undefined) {
          const loginData: LoginData = {username: username, password: password};
          await this.loginHandler.doLogin(selectedFlow, loginData); 
          window.location = window.location; // restart the app
        }
      } catch (e) {
        alert(e);
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
