import { createTextVNode } from "inferno";

import { IRCLikeMessageItem } from "../MessageItems";
import { readableTimestamp } from "../utils";
import "./UnsupportedEventItem.css";

function IRCLikeUnsupportedEventItem({ isFocused, senderId }) {
  return (
    <div className={"event" + (isFocused ? "--focused" : "")} tabIndex={0}>
      <p>Unsupported Event from {createTextVNode(senderId)}</p>
    </div>
  );
}

function MembershipEvent({ evt, isFocused }) {
  let content = evt.getContent();
  const senderId = evt.getSender();

  switch (content.membership.toLower()) {
    case "join":
      return (
        <div className={"event" + (isFocused ? "--focused" : "")} tabIndex={0}>
          <p $HasTextChildren>
            {createTextVNode(readableTimestamp(ts) + content.displayName + " joined.")}
          </p>
        </div>
      );
    default:
      if (isFocused) console.log("REPORT", evt);
      return (
        <div className={"event" + (isFocused ? "--focused" : "")} tabIndex={0}>
          <p $HasTextChildren>{createTextVNode(`Unknown membership event from ${content.displayName}`)}</p>
        </div>
      );
  }
}

export default function RoomEvent({ evt, isFocused }) {
  const type = evt.getType();
  const senderId = evt.getSender();
  const MessageItem = IRCLikeMessageItem;
  const UnsupportedEventItem = IRCLikeUnsupportedEventItem;


  switch (type) {
    case "m.room.message":
      return (
        <MessageItem
          date={evt.getDate()}
          sender={{ userId: senderId }}
          content={evt.getContent()}
          isFocused={isFocused}
        />
      );
    /*
    case "m.room.member":
      return (
        <MembershipEvent
          evt={evt}
          isFocused={isFocused}
        />
      );
      */
    default:
      if (isFocused) console.log(evt);
      return <UnsupportedEventItem senderId={senderId} isFocused={isFocused} />;
  }
}
