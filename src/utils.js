import { getHttpUriForMxc } from "matrix-js-sdk";

const defaultAvatarSize = 36;

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
    )
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

export { isRoom, isDM, getAvatarOrDefault, startDM, makeHumanReadableEvent };
