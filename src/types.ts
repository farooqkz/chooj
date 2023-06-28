import { Room } from "matrix-js-sdk";

interface RoomsViewState {
  cursor: number;
  rooms: Room[];
}

interface RoomsViewProps {
  selectedRoomCb: (roomId: null | string) => void;
}

type startCall = (roomId: string, type: string, userId: string) => void;

interface Homeserver {
  base_url: string;
}

interface IdentityServer {
  base_url: string;
}

interface WellKnown {
  "m.homeserver": Homeserver;
  "m.identity_server"?: IdentityServer;
}

interface LoginData {
  user_id: string;
  access_token: string;
  well_known: WellKnown;
}

export {
  RoomsViewState,
  RoomsViewProps,
  startCall,
  LoginData,
  WellKnown,
};
