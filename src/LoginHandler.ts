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

  public async findHomeserver(name: string) {
    name = name.replace("https://", "");
    name = name.replace("http://", "");
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
      localforage.setItem("well_known", {
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
