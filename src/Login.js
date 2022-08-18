import { Component } from "inferno";
import * as matrixcs from "matrix-js-sdk";
import * as localforage from "localforage";

import TextListItem from "./ui/TextListItem";
import TextInput from "./ui/TextInput";
import SoftKey from "./ui/SoftKey";
import Header from "./ui/Header";
import ListView from "./ListView";
import LoginWithQR from "./LoginWithQR";
import DeviceID from "./DeviceID";

class Login extends Component {
  cursorChangeCb = (cursor) => {
    this.setState({ cursor: cursor });
  };

  handleKeyDown = (evt) => {
    if (evt.key === "Backspace" || evt.key === "b") {
      evt.preventDefault();
      if (this.state.loginWithQR) {
        this.setState({ loginWithQR: false });
        return;
      }
      if (this.state.stage <= 0) {
        if (window.confirm("Quit?")) {
          window.close();
        } else {
          this.setState({ stage: 0 });
        }
        return;
      }
      this.setState((prevState) => {
        prevState.cursor = 0;
        prevState.stage--;
      });
    }
    if (evt.key === "c" || evt.key === "Call") {
      if (this.state.stage !== 0) return;
      if (this.state.cursor !== 3) return;
      this.setState({ loginWithQR: true });
    }
  };

  doLogin = () => {
    switch (this.selectedLoginFlow.type) {
      case "m.login.password":
        window.mClient
          .loginWithPassword(
            `@${this.username}:${this.homeserverName}`,
            this.password
          )
          .then((result) => {
            localforage.setItem("login", result).then(() => {
              alert("Logged in as " + this.username);
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
                alert("Too many requests! Retry after" + retry.toString());
                break;
              default:
                alert("Login failed for some unknown reason");
                break;
            }
          });
        break;
      default:
        alert("Invalid/unsupported login method. This is likely a bug");
        break;
    }
  };

  rightCb = () => {
    switch (this.state.stage) {
      case 0:
        if (!this.homeserverUrl.startsWith("https://"))
          this.homeserverUrl = "https://" + this.homeserverUrl;
        window.mClient = matrixcs.createClient({
          baseUrl: this.homeserverUrl,
        });
        window.mClient.loginFlows().then((result) => {
          this.loginFlows = result.flows;
          this.setState({ cursor: 0, stage: 1 });
        });
        break;
      case 1:
        this.selectedLoginFlow = this.loginFlows[this.state.cursor];
        if (this.selectedLoginFlow.type !== "m.login.password") {
          window.alert("The selected login method is not implemented, yet.");
        } else {
          this.setState({ cursor: 0, stage: 2 });
        }
        break;
      case 2:
        this.doLogin();
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

  constructor(props) {
    super(props);
    this.stageNames = ["Login Info", "Login method", "Login"];
    this.loginFlows = [];
    this.selectedLoginFlow = "";
    this.homeserverUrl = "";
    this.username = "";
    this.password = "";
    this.homeserverName = "";
    this.device_id = DeviceID.DeviceID;
    this.state = {
      stage: 0,
      cursor: 0,
      loginWithQR: false,
    };
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  render() {
    if (this.state.loginWithQR) {
      return <LoginWithQR />;
    }
    let listViewChildren;
    switch (this.state.stage) {
      case 0:
        listViewChildren = [
          {
            placeholder: "example.com",
            onChange: (value) => {
              this.homeserverName = value;
            },
            label: "Homeserver name(without https://)",
            type: "input",
          },
          {
            placeholder: "matrix.example.com",
            onChange: (value) => {
              this.homeserverUrl = value;
            },
            label: "Homeserver URL",
            type: "input",
          },
          {
            placeholder: "mrpotato",
            onChange: (value) => {
              this.username = value;
            },
            label: "Username",
            type: "input",
          },
          {
            tertiary:
              "Press Call button and scan a QR in the following format to login with QR code instead of typing all these(PASS = password authentication): PASS server_name server_url username password",
            type: "text",
          },
        ].map((attrs, index) => {
          const C = attrs.type === "input" ? TextInput : TextListItem;
          if (index === this.state.cursor) {
            return <C {...attrs} isFocused />;
          } else {
            return <C {...attrs} />;
          }
        });
        break;
      case 1:
        listViewChildren = this.loginFlows.map((flow, index) => {
          if (index === this.state.cursor) {
            return <TextListItem primary={flow.type} isFocused />;
          } else {
            return <TextListItem primary={flow.type} />;
          }
        });
        break;
      case 2:
        if (this.selectedLoginFlow.type === "m.login.password") {
          listViewChildren = (
            <TextInput
              placeholder="%$#@%#$"
              fieldType="password"
              label="Enter password"
              onChange={(value) => {
                this.password = value;
              }}
              isFocused
            />
          );
        } else {
          alert("Unsupported login flow: " + this.selectedLoginFlow.type);
          listViewChildren = <TextListItem primary=":(" isFocused />;
        }
        break;
      default:
        alert("Invalid or not implemented state :(");
        break;
    }
    return (
      <div>
        <Header text={this.stageNames[this.state.stage]} />
        <ListView
          cursorChangeCb={this.cursorChangeCb}
          cursor={this.state.cursor}
        >
          {listViewChildren}
        </ListView>
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
