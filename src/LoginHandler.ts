import { fetch as customFetch } from "./fetch";
import { WellKnown } from "./types";
import { LoginFlow } from "matrix-js-sdk/lib/@types/auth";
import * as localforage from "localforage";
import { createClient } from "matrix-js-sdk";
import shared from "./shared";

export type LoginData = {
  username: string;
  password: string;
};

export default class LoginHandler {
  public baseUrl: string;
  public homeserverName: string;
  public username: string;
  public password: string;
  public loginFlows: LoginFlow[];

  constructor() {
    this.homeserverName = "";
    this.username = "";
    this.password = "";
    this.loginFlows = [];
    this.baseUrl = "";
  }

  private setWellKnown(wellKnown: WellKnown) {
    return localforage.setItem("well_known", wellKnown);
  }

  public async doLogin(loginFlow: LoginFlow, loginData: LoginData) {
    // TODO implement more login flows
    // Instead of implementing them one by one, consider using mClient.login
    // and passing loginData (which needs to be properly formed according to their spec)
    // (may or may not be a bad idea)
    try {
      let loginResult: any;
      let username: string = `@${loginData.username}:${this.homeserverName}`;
      switch (loginFlow.type) {
        case "m.login.password":
          let password: string = loginData.password;
          loginResult = await shared.mClient.loginWithPassword(
            username,
            password
          );
          break;
        default:
          throw new Error("Unsupported");
      }
      if (loginResult.well_known) {
        this.setWellKnown(loginResult.well_known);
        console.log(
          "Received a well_known from client login property. Updating previous settings."
        );
        console.log(loginResult.well_known);
      }
      await localforage.setItem("login", loginResult);
      alert("Logged in as " + username);
    } catch (e: any) {
      let message: string;
      switch (e.errcode) {
        case "M_FORBIDDEN":
          message = "Incorrect login credentials";
          break;
        case "M_USER_DEACTIVATED":
          message = "This account has been deactivated";
          break;
        case "M_LIMIT_EXCEEDED":
          const retry = Math.ceil(e.retry_after_ms / 1000);
          message = `Too many requests! Retry after ${retry.toString()}`;
          break;
        default:
          if (e.message === "Unsupported") {
            message = "Login flow selected is unsupported";
          } else if (e.errcode) {
            message = e.errcode;
          } else {
            message = `Login failed for some unknown reason: ${e.message}`;
          }
          break;
      }
      throw new Error(message);
    }
  }

  public async findHomeserver(name: string) {
    name = name.replace("https://", "");
    name = name.replace("http://", "");
    this.homeserverName = name;
    let baseUrl: string = "";
    let wellKnownUrl: string = `https://${name}/.well-known/matrix/client`;
    try {
      let r: Response = await fetch(wellKnownUrl);
      if (!r.ok) {
        throw new Error("404");
      }
      let wellKnown: WellKnown = await r.json();
      baseUrl = wellKnown["m.homeserver"].base_url;
    } catch (e: any) {
      console.warn(`.well-known not found or malformed at ${wellKnownUrl}`);
      baseUrl = "https://" + name;
    } finally {
      this.baseUrl = baseUrl;
      try {
        shared.mClient = createClient({
          baseUrl: baseUrl,
          fetchFn: customFetch,
        });
        let result = await shared.mClient.loginFlows();
        if (!result.flows) {
          throw new Error("Got no flows");
        }
        this.loginFlows = result.flows;
      } catch (e) {
        alert(`No server found at ${baseUrl}`);
        console.error(e);
      }
      this.setWellKnown({
        "m.homeserver": { base_url: baseUrl },
        "m.identity_server": { base_url: "https://vector.im" },
        // TODO Where to infer this outside of actual .well-known?
      });
    }
  }
}
