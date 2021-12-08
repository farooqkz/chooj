import { createTextVNode } from "inferno";
import "./IRCLikeMessageItem.css";

function IRCLikeMessageItemText({ text, sender, isFocused }) {
  return (
    <div className={"ircmsg" + (isFocused ? "--focused" : "")} tabIndex={0}>
      <p>
        <b $HasTextChildren>{`<${sender}>`}</b>
        {createTextVNode(" " + text)}
      </p>
    </div>
  );
}

function IRCLikeMessageItemNotice({ isFocused, text, sender }) {
  return (
    <div className={"ircmsg" + (isFocused ? "--focused" : "")} tabIndex={0}>
      <p>
        <i>
          <b $HasTextChildren>{`<${sender}>`}</b>
          {createTextVNode(" " + text)}
        </i>
      </p>
    </div>
  );
}

function IRCLikeMessageItemUnknown({ isFocused, sender }) {
  return (
    <div className={"ircmsg" + (isFocused ? "--focused" : "")} tabIndex={0}>
      <p $HasTextChildren>Unsupported message type was sent from {sender}</p>
    </div>
  );
}

function IRCLikeMessageItem({ sender, content, isFocused }) {
  const userId = sender.userId;
  let displayName = window.mClient.getUser(userId).displayName || userId;
  switch (content.msgtype) {
    case "m.text":
      return (
        <IRCLikeMessageItemText
          sender={displayName}
          text={content.body}
          isFocused={isFocused}
        />
      );
    case "m.notice":
      return (
        <IRCLikeMessageItemNotice
          sender={displayName}
          text={content.body}
          isFocused={isFocused}
        />
      );
    case "m.emote":
    case "m.image":
    case "m.video":
    case "m.audio":
    case "m.location":
    case "m.file":
    default:
      return (
        <IRCLikeMessageItemUnknown
          sender={sender.userId}
          isFocsued={isFocused}
        />
      );
  }
}

export default IRCLikeMessageItem;
