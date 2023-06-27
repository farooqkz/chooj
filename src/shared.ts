import { MatrixClient } from "matrix-js-sdk";
import { RoomsViewState } from "./types";

interface SharedStuff {
  mClient: null | MatrixClient,
  stateStores: Map<string, RoomsViewState>,
}

export const shared: SharedStuff = {
  mClient: null,
  // It's a MatrixClient instance
  stateStores: new Map(),
  // This is used to save state of components 
  // on unmount and later retrieve it when
  // the component is constructed.
};
