import { getHttpUriForMxc } from "matrix-js-sdk";

const defaultAvatarSize = 36;

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
  return {
    time: evt.getTs(),
    event_: makeHumanReadableEvent(
      evt.getType(),
      evt.getContent(),
      window.mClient.getUser(evt.getSender()).displayName,
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
      "/person_icon.png"
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
      ) || "/hash_icon.png";
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

export {
  updateState,
  newRoomInState,
  isRoom,
  isDM,
  getAvatarOrDefault,
  startDM,
  makeHumanReadableEvent,
};
