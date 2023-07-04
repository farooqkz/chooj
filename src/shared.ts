import { MatrixClient } from "matrix-js-sdk";
import { RoomsViewState } from "./types";

class Shared {
  public stateStores: Map<string, RoomsViewState> = new Map();
  // This is used to save state of components
  // on unmount and later retrieve it when
  // the component is constructed.
  private _mClient: MatrixClient | null;

  constructor() {
    this._mClient = null;
  }

  get mClient(): MatrixClient {
    if (!this._mClient) {
      throw new Error("mClient is null!");
    }
    return this._mClient;
  }

  set mClient(val: MatrixClient) {
    this._mClient = val;
  }
}

let shared = new Shared();

export default shared;
