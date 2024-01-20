import { fetch as customFetch } from "./fetch";
import { WellKnown } from "./types";
import { LoginFlow } from "matrix-js-sdk/lib/@types/auth";
import * as localforage from "localforage";
import { createClient } from "matrix-js-sdk";
import shared from "./shared";

export default class LoginHandler {
  public base_url: string;
  public homeserverName: string;
  public username: string;
  public password: string;
  public loginFlows: LoginFlow[];

  constructor() {
    this.homeserverName = "";
    this.username = "";
    this.password = "";
    this.loginFlows = [];
    this.base_url = "";
  }

  private setWellKnown(well_known: WellKnown) {
    return localforage.setItem("well_known", well_known);
  }

  public async doLogin(loginFlow: LoginFlow, loginData: any) {
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
          loginResult = await shared.mClient
            .loginWithPassword(username, password);
          break;
        default:
          throw new Error("Unsupported");
          break;
      }
      if (loginResult.well_known) {
        this.setWellKnown(loginResult.well_known)
        console.log("Received a well_known from client login property. Updating previous settings.")
        console.log(loginResult.well_known)
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
            message = "Login flow selected is unsupported"
          } else if (e.errcode) {
            message = e.errcode;
          } else {
            message = `Login failed for some unknown reason: ${e.message}`;
          }
          break;
      }
      throw new Error(message)
    }
  }

  public async findHomeserver(name: string) {
    name = name.replace("https://", "");
    name = name.replace("http://", "");
    this.homeserverName = name;
    let base_url: string = "";
    let well_known_url = `https://${name}/.well-known/matrix/client`;
      try {
      let r: Response = await fetch(well_known_url);
      if (!r.ok) {
        throw new Error("404");

      }
      let well_known: WellKnown = await r.json();
      base_url = well_known["m.homeserver"].base_url;
    } catch (e: any) {
      console.log(`.well-known not found or malformed at ${well_known_url}`);
      base_url = "https://" + name;
    } finally {
      this.base_url = base_url;
      this.setWellKnown({
        "m.homeserver": {"base_url": base_url},
        "m.identity_server": {"base_url": "https://vector.im"},  // TODO Where to infer this outside of actual .well-known?
      })
      shared.mClient = createClient({
        baseUrl: base_url,
        fetchFn: customFetch,
      });
      let result = await shared.mClient.loginFlows()
      this.loginFlows = result.flows;
    }
  }
}
