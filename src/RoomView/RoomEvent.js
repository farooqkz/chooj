import { createTextVNode } from "inferno";
import { MatrixEvent } from "matrix-js-sdk";

import { IRCLikeMessageItem } from "../MessageItems";
import { readableTimestamp } from "../utils";
import "./UnsupportedEventItem.css";

function IRCLikeUnsupportedEventItem({ isFocused, senderId, type }) {
  return (
    <div className={"event" + (isFocused ? "--focused" : "")} tabIndex={0}>
      <p>Unsupported Event from {createTextVNode(senderId)}: {type}</p>
    </div>
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
        <div className={"event" + (isFocused ? "--focused" : "")} tabIndex={0}>
          <p $HasTextChildren>
            {readableTimestamp(ts) + content.displayname + " joined."}
          </p>
        </div>
      );
    case "leave":
      return (
        <div className={"event" + (isFocused ? "--focused" : "")} tabIndex={0}>
          <p $HasTextChildren>
            {readableTimestamp(ts) + content.displayname + " left."}
          </p>
        </div>
      );
    default:
      if (isFocused) console.log("REPORT", evt);
      return (
        <div className={"event" + (isFocused ? "--focused" : "")} tabIndex={0}>
          <p $HasTextChildren>{`Unknown membership event from ${content.displayname}: ${eventType}`}</p>
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

    case "m.room.member":
      return (
        <MembershipEvent
          evt={evt}
          isFocused={isFocused}
        />
      );

    default:
      if (isFocused) console.log(evt);
      return <UnsupportedEventItem senderId={senderId} isFocused={isFocused} type={type} />;
  }
}
