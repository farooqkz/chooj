import { Component } from "inferno";
import * as localforage from "localforage";
import { TextListItem, TextInput, Header, SoftKey, ListViewKeyed } from "KaiUI";
import shared from "./shared";
import { WellKnown } from "./types";
import LoginWithQR from "./LoginWithQR";
import LoginHandler from "./LoginHandler";
import { LoginFlow } from "matrix-js-sdk/lib/@types/auth";

interface LoginState {
  cursor: number;
  stage: number;
  loginWithQr: boolean;
}

class Login extends Component<{}, LoginState> {
  private readonly stageNames: string[];
  private selectedLoginFlow?: LoginFlow;
  public state: LoginState;
  private loginHandler: LoginHandler;
  private homeserverName: string;
  private username: string;
  private password: string;

  cursorChangeCb = (cursor: number) => {
    this.setState({ cursor: cursor });
  };

  handleKeyDown = (evt: KeyboardEvent) => {
    if (evt.key === "Backspace" || evt.key === "b") {
      if (this.state.loginWithQr) {
        evt.preventDefault();
        this.setState({ loginWithQr: false });
        return;
      }
      if (this.state.stage === 0) {
        if (this.state.cursor > 1) {
          evt.preventDefault();
        }
      } else if (this.state.stage === 2) {
        if (this.state.cursor !== 0) {
          evt.preventDefault();
        }
      }
      if (this.state.stage <= 0) {
        return;
      }
      this.setState((prevState: LoginState) => {
        prevState.cursor = 0;
        prevState.stage--;
      });
      return;
    }
    if (evt.key === "c" || evt.key === "Call") {
      if (this.state.stage !== 0) return;
      this.setState({ loginWithQr: true });
    }
  };

  rightCb = () => {
    switch (this.state.stage) {
      case 0:
            this.loginHandler.findHomeserver(this.homeserverName).then( () => {
                this.setState({ cursor: 0, stage: 1})
            }).catch((e: any) => {
                window.alert("Could not connect to homeserver");
                console.log(e);
            });
        break;
      case 1:
        this.selectedLoginFlow = this.loginHandler.loginFlows[this.state.cursor];
        if (this.selectedLoginFlow.type !== "m.login.password") {
          window.alert("The selected login method is not implemented, yet.");
        } else {
          this.setState({ cursor: 0, stage: 2 });
        }
        break;
      case 2:
        let loginData = {'username': this.username, 'password': this.password};
        if (this.selectedLoginFlow !== undefined) {
          this.loginHandler.doLogin(this.selectedLoginFlow, loginData).then(() => {
            window.location = window.location;
          }).catch((e) => alert(e.message));
        } else {
          throw new Error("Undefined selectedLoginFlow")
        }
        break;
      default:
        alert("Invalid stage!");
        break;
    }
  };

  centerCb = () => {
    if (this.state.stage === 2) {
      window.alert(this.password);
    }
  };

  constructor(props: any) {
    super(props);
    this.homeserverName = "";
    this.username = "";
    this.password = "";
    this.stageNames = ["Login Info", "Login method", "Login"];
    this.loginHandler = new LoginHandler()
    this.state = {
      stage: 0,
      cursor: 0,
      loginWithQr: false,
    };
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  render() {
    if (this.state.loginWithQr) {
      return <LoginWithQR />;
    }
    let listViewChildren;
    switch (this.state.stage) {
      case 0:
        listViewChildren = [
          {
            placeholder: "example.com",
            onChange: (value: string) => {
              this.homeserverName = value;
            },
            label: "Homeserver name",
            type: "input",
            key: "homeserver",
          },
          {
            placeholder: "mrpotato",
            onChange: (value: string) => {
              this.username = value;
            },
            label: "Username",
            type: "input",
            key: "username",
          },
          {
            tertiary:
              "Press Call button and scan a QR in the following format to login with QR code instead of typing all these(PASS = password authentication): PASS server_name username password",
            type: "text",
            key: "qrHint",
          },
        ].map((attrs) => {
          const C = attrs.type === "input" ? TextInput : TextListItem;
          return <C {...attrs} />;
        });
        break;
      case 1:
        listViewChildren = this.loginHandler.loginFlows.map((flow: LoginFlow) => {
          return <TextListItem key={"flow" + flow.type} primary={flow.type} />;
        });
        break;
      case 2:
        if (!this.selectedLoginFlow) {
          throw new Error("selectedLoginFlow is not defined");
        }
        if (this.selectedLoginFlow.type === "m.login.password") {
          listViewChildren = (
            <TextInput
              key="password-field"
              placeholder="Your super secret pass"
              fieldType="password"
              label="Enter password"
              onChange={(value: string) => {
                this.password = value;
              }}
            />
          );
        } else {
          alert("Unsupported login flow: " + this.selectedLoginFlow.type);
          listViewChildren = <TextListItem key="unsupported" primary=":(" />;
        }
        break;
      default:
        alert("Invalid or not implemented state :(");
        break;
    }
    return (
      <div>
        <Header text={this.stageNames[this.state.stage]} />
        <ListViewKeyed
          cursorChangeCb={this.cursorChangeCb}
          cursor={this.state.cursor}
          $HasKeyedChildren
        >
          {listViewChildren}
        </ListViewKeyed>
        <footer>
          <SoftKey
            leftText="Quit"
            leftCb={() => window.close()}
            centerCb={this.centerCb}
            centerText={this.state.stage === 2 ? "Show" : ""}
            rightText="Next"
            rightCb={this.rightCb}
          />
        </footer>
      </div>
    );
  }
}

export default Login;
