import { getHttpUriForMxc } from "matrix-js-sdk";
import hashIcon from "./hash_icon.png";
import personIcon from "./person_icon.png";

const defaultAvatarSize = 36;

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function updateState(room, state, dm) {
  let isAlreadyOurRoom = false;
  // ^ is <room> a room we already have in this.state.rooms?
  state.rooms = state.rooms.map((ourRoom) => {
    if (room.roomId === ourRoom.roomId) {
      isAlreadyOurRoom = true;
      let events = room.getLiveTimeline().getEvents();
      let lastEvent = makeEvent(events[events.length - 1], dm);
      ourRoom.lastEventTime = lastEvent.time;
      ourRoom.lastEvent = lastEvent.event_;
    }
    return ourRoom;
  });
  if (!isAlreadyOurRoom) {
    state.rooms.push(newRoomInState(room, dm));
  }
  return state;
}

function makeEvent(evt, dm) {
  let user = window.mClient.getUser(evt.getSender());
  return {
    time: evt.getTs(),
    event_: makeHumanReadableEvent(
      evt.getType(),
      evt.getContent(),
      user && user.displayName,
      window.mClient.getUserId(),
      dm
    ),
  };
}

function newRoomInState(room, dm) {
  const client = window.mClient;
  let events = room.getLiveTimeline().getEvents();
  let lastEvent = makeEvent(events[events.length - 1], dm);
  let result = {
    roomId: room.roomId,
    lastEvent: lastEvent.event_,
    lastEventTime: lastEvent.time,
  };
  if (dm) {
    let theOtherId = room.guessDMUserId();
    let userObj = client.getUser(theOtherId);
    result.avatarUrl = getAvatarOrDefault(
      userObj.avatarUrl,
      personIcon
    );
    result.userId = theOtherId;
    result.displayName = room.getDefaultRoomName(client.getUserId());
  } else {
    result.avatarUrl =
      room.getAvatarUrl(
        client.baseUrl,
        defaultAvatarSize,
        defaultAvatarSize,
        "scale"
      ) || hashIcon;
    result.displayName = room.name;
  }
  return result;
}

function isDM(room) {
  return room.getJoinedMemberCount() === 2 && room.getMyMembership() === "join";
}

function isRoom(room) {
  return room.getJoinedMemberCount() > 2 && room.getMyMembership() === "join";
}

function getAvatarOrDefault(mxcUrl, defaultUrl, size) {
  size = size || defaultAvatarSize;
  if (mxcUrl) {
    return getHttpUriForMxc(
      window.mClient.baseUrl,
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

function startDM(client, userId) {
  // TODO
}

function eventSender(sender, myself, dm) {
  if (myself === sender) {
    return "You";
  } else {
    if (dm) {
      return "They";
    } else {
      return sender;
    }
  }
}

function makeHumanReadableEvent(type, content, sender, myself, dm) {
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

function bytesToHigherScale(b) {
  let units = ["B", "KiB", "MiB", "GiB"];
  let unit = 0;
  while (b >= 512 && unit < 3) {
    b /= 1024;
    unit++;
  }
  b = b.toFixed(2);
  return `${b}${units[unit]}`;
}

function msToHigherScale(ms) {
  let units = ["s", "m", "h"];
  let unit = 0;
  ms /= 1000;
  while (ms >= 60) {
    ms /= 60;
    unit++;
  }
  ms = ms.toFixed(2);
  return `${ms}${units[unit]}`;
}

function mxcMediaToHttp(hsUrl, mxcUrl) {
  let [serverName, mediaId] = mxcUrl.split("/").slice(2, 4);
  return `${hsUrl}/_matrix/media/v3/download/${serverName}/${mediaId}`;
}

export {
  updateState,
  newRoomInState,
  isRoom,
  isDM,
  getAvatarOrDefault,
  startDM,
  makeHumanReadableEvent,
  urlBase64ToUint8Array,
  bytesToHigherScale,
  msToHigherScale,
  mxcMediaToHttp,
};
