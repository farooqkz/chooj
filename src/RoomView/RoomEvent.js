import { createTextVNode } from "inferno";

import { IRCLikeMessageItem } from "../MessageItems";
import { readableTimestamp, getSomeDisplayName } from "../utils";
import "./UnsupportedEventItem.css";

function Event({ children, isFocused }) {
  return (
    <div className={"event" + (isFocused ? "--focused" : "")} tabIndex={0}>
      {children}
    </div>
  );
}

function IRCLikeUnsupportedEventItem({ isFocused, senderId, type }) {
  return (
    <Event isFocused={isFocused}>
      <p>Unsupported Event from {createTextVNode(getSomeDisplayName(senderId))}: {type}</p>
    </Event>
  );
}

/**
 * @param {{evt: MatrixEvent, isFocused: boolean}} params 
 */
function MembershipEvent({ evt, isFocused }) {
  let content = evt.getContent();
  // const senderId = evt.getSender();
  const ts = evt.getTs();

  const eventType = content.membership.toLowerCase()

  switch (eventType) {
    case "join":
      return (
        <Event isFocused={isFocused}>
          <p $HasTextChildren>
            {readableTimestamp(ts) + content.displayname + " joined."}
          </p>
        </Event>
      );
    case "leave":
      return (
        <Event isFocused={isFocused}>
          <p $HasTextChildren>
            {readableTimestamp(ts) + content.displayname + " left."}
          </p>
        </Event>
      );
    default:
      if (isFocused) console.log("REPORT", evt);
      return (
        <Event isFocused={isFocused}>
          <p $HasTextChildren>{`Unknown membership event from ${content.displayname}: ${eventType}`}</p>
        </Event>
      );
  }
}

export default function RoomEvent({ evt, isFocused }) {
  const type = evt.getType();
  const senderId = evt.getSender();
  const MessageItem = IRCLikeMessageItem;
  const UnsupportedEventItem = IRCLikeUnsupportedEventItem;
  const displayName = getSomeDisplayName(senderId);
  const ts = readableTimestamp(evt.getTs());
  const status = evt.status;

  switch (type) {
    case "m.room.message":
      return (
        <MessageItem
          date={evt.getDate()}
          sender={{ userId: senderId }}
          content={evt.getContent()}
          status={status}
          isFocused={isFocused}
        />
      );
    case "m.room.member":
      return (
        <MembershipEvent
          evt={evt}
          isFocused={isFocused}
        />
      );
    case "m.call.hangup":
      return (
        <Event isFocused={isFocused}>
          <p>
            <b $HasTextChildren>
              {ts}
            </b>
            {createTextVNode(`${displayName} has ended the call.`)}
          </p>
        </Event>
      );
    case "m.call.invite":
      return (
        <Event isFocused={isFocused}>
          <p>
            <b $HasTextChildren>
              {ts}
            </b>
            {createTextVNode(`${displayName} has started a call.`)}
          </p>
        </Event>
      );
    case "m.room.create":
      return (
        <Event isFocused={isFocused}>
          <p>
            <b $HasTextChildren>
              {ts}
            </b>
            {createTextVNode(`${displayName} created this room.`)}
          </p>
        </Event>
      );
    default:
      if (isFocused) console.log(evt);
      return <UnsupportedEventItem senderId={senderId} isFocused={isFocused} type={type} />;
  }
}
