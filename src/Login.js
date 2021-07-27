import { Component } from "inferno";
import * as matrixcs from "matrix-js-sdk";
import * as localforage from "localforage";

import TextListItem from "./ui/TextListItem";
import TextInput from "./ui/TextInput";
import SoftKey from "./ui/SoftKey";
import Header from "./ui/Header";
import ListView from "./ListView";

class Login extends Component {
  cursorChangeCb = (cursor) => {
    this.setState({ cursor: cursor });
  };

  handleKeyDown = (evt) => {
    if (evt.key === "Backspace" || evt.key === "b") {
      evt.preventDefault();
      if (this.state.stage <= 0) {
        if (window.confirm("Quit?")) window.close();
      }
      this.setState((prevState) => {
        prevState.cursor = 0;
        prevState.stage--;
      });
    }
  };

  doLogin = () => {
    switch (this.selectedLoginFlow.type) {
      case "m.login.password":
        window.mClient
          .loginWithPassword(
            `@${this.username}:${this.homeserverUrl.replace("https://", "")}`,
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

  constructor(props) {
    super(props);
    this.stageNames = ["Login Info", "Login method", "Login"];
    this.loginFlows = [];
    this.selectedLoginFlow = "";
    this.homeserverUrl = "";
    this.username = "";
    this.password = "";
    this.state = {
      stage: 0,
      cursor: 0,
    };
  }

  render() {
    let listViewChildren;
    switch (this.state.stage) {
      case 0:
        listViewChildren = [
          {
            placeholder: "matrix.example.com",
            onChange: (value) => {
              this.homeserverUrl = value;
            },
            label: "Homeserver URL",
          },
          {
            placeholder: "mrpotato",
            onChange: (value) => {
              this.username = value;
            },
            label: "Username",
          },
        ].map((attrs, index) => {
          if (index === this.state.cursor) {
            return <TextInput {...attrs} isFocused />;
          } else {
            return <TextInput {...attrs} />;
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
        <footer $HasVNodeChildren>
          <SoftKey
            leftText="Quit"
            leftCb={() => window.close()}
            rightText="Next"
            rightCb={this.rightCb}
          />
        </footer>
      </div>
    );
  }
}

export default Login;
