import { getHttpUriForMxc, Room, MatrixClient, MatrixEvent, IContent } from "matrix-js-sdk";
import { render } from "inferno";
import { RoomsViewState } from "./types";
import shared from "./shared";

const defaultAvatarSize = 36;

function urlBase64ToUint8Array(base64String: string) : Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function updateState(room: Room, state: RoomsViewState) : RoomsViewState {
  let isAlreadyOurRoom = false;
  // ^ is <room> a room we already have in this.state.rooms?
  state.rooms = state.rooms.map((ourRoom: Room) => {
    if (room.roomId === ourRoom.roomId) {
      isAlreadyOurRoom = true;
    }
    return ourRoom;
  });
  if (!isAlreadyOurRoom) {
    state.rooms.push(room);
  }
  return state;
}

function isDM(room: Room) : boolean {
  return room.getJoinedMemberCount() === 2 && room.getMyMembership() === "join" && !room.isSpaceRoom();
}

function isRoom(room: Room) : boolean {
  return room.getJoinedMemberCount() > 2 && room.getMyMembership() === "join" && !room.isSpaceRoom();
}

function getAvatarOrDefault(mxcUrl: string | undefined, defaultUrl: string, size?: number) : string {
  size = size || defaultAvatarSize;
  if (mxcUrl && shared.mClient) {
    return getHttpUriForMxc(
      shared.mClient.baseUrl,
      mxcUrl,
      size,
      size,
      "scale",
      true
    );
  } else {
    return defaultUrl;
  }
}

function startDM(_client: MatrixClient, _userId: string) {
  // TODO
}

function eventSender(sender: string, myself: boolean, dm?: boolean) : string {
  if (myself) {
    return "You";
  } else {
    if (dm) {
      return "They";
    } else {
      return sender;
    }
  }
}

function makeHumanReadableEvent(evt: MatrixEvent, dm?: boolean) : string {
  if (!(evt instanceof Object)) {
    console.log("BOOO", evt);
  }
  let content: IContent | undefined = evt.getContent();
  if (!content) {
    return "";
  }
  const type: string = evt.getType();
  const sender: string = evt.getSender() || "-@UnknownUser@-";
  const myself: boolean = evt.getSender() === shared.mClient.getUserId();

  switch (type) {
    case "m.call.hangup":
      return eventSender(sender, myself, dm) + " hanged the call up";
    case "m.call.reject":
      return eventSender(sender, myself, dm) + " rejected the call";
    case "m.room.member":
      return (
        eventSender(sender, myself, dm) +
        " " +
        content.membership +
        "ed the room"
      );
    case "m.room.message":
      if (!content.msgtype)
        throw new Error("The event is a room message but msgtype is not defined");
      return (
        eventSender(sender, myself, dm) +
        ": " +
        (["m.text", "m.notice"].includes(content.msgtype)
          ? content.body
          : content.msgtype)
      );
    default:
      return eventSender(sender, myself, dm) + " " + type;
  }
}

function bytesToHigherScale(b: number) : string {
  let units: string[] = ["B", "KiB", "MiB", "GiB"];
  let unit: number = 0;
  while (b >= 512 && unit < 3) {
    b /= 1024;
    unit++;
  }
  return `${b.toFixed(2)}${units[unit]}`;
}

function msToHigherScale(ms: number) : string {
  let units: string[] = ["s", "m", "h"];
  let unit: number = 0;
  ms /= 1000;
  while (ms >= 60) {
    ms /= 60;
    unit++;
  }
  return `${ms.toFixed(2)}${units[unit]}`;
}

function mxcMediaToHttp(hsUrl: string, mxcUrl: string) : string {
  let [serverName, mediaId] = mxcUrl.split("/").slice(2, 4);
  return `${hsUrl}/_matrix/media/v3/download/${serverName}/${mediaId}`;
}

function toast(message: string, timeout: number) {
  let container: HTMLElement | null = document.querySelector("#toast");
  if (!container) return;
  container.style.display = "block";
  render(<p $HasTextChildren>{message}</p>, container);
  setTimeout(() => {
    if (container) 
      container.style.display = "none";
  }, timeout);
}

function readableTimestamp(ts: number, includeSeconds?: boolean) : string {
  let date = new Date(ts);
  let h = date.getHours().toString();
  let m = date.getMinutes().toString();
  if (h.length === 1) {
    h = "0" + h;
  }
  if (m.length === 1) {
    m = "0" + m;
  }
  let d = `${h}:${m}`;
  if (includeSeconds) {
    let s = date.getSeconds().toString();
    if (s.length === 1) {
      s = "0" + s;
    }
    d += ":" + s;
  }
  return "[" + d + "] ";
}

function getSomeDisplayName(userId: string) : string {
  let userObj = shared.mClient.getUser(userId);
  if (userObj) {
    return userObj.displayName || userObj.userId.split(":")[0].replace("@", "");
  } else {
    return "-@UnknownUser@-";
  }
}

export {
  updateState,
  isRoom,
  isDM,
  getAvatarOrDefault,
  startDM,
  makeHumanReadableEvent,
  urlBase64ToUint8Array,
  bytesToHigherScale,
  msToHigherScale,
  mxcMediaToHttp,
  toast,
  readableTimestamp,
  getSomeDisplayName,
};
