import { Room } from "matrix-js-sdk";

interface RoomsViewState {
  cursor: number;
  rooms: Array<Room>;
}

interface RoomsViewProps {
  selectedRoomCb: (roomId: null | string) => void;
}

export {
  RoomsViewState,
  RoomsViewProps,
};
