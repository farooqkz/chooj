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
    default:
      return eventSender(sender, myself, dm) + type;
  }
}

export { startDM, makeHumanReadableEvent };
