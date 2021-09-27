import { createTextVNode } from "inferno";
import "./IRCLikeMessageItem.css";

function IRCLikeMessageItemText(props) {
  return (
    <div
      className={"ircmsg" + (props.isFocused ? "--focused" : "")}
      tabIndex={0}
    >
      <p>
        <b $HasVNodeChildren>{createTextVNode(`<${props.sender}>`)}</b>
        {" " + props.text}
      </p>
    </div>
  );
}

function IRCLikeMessageItemNotice(props) {
  return (
    <div
      className={"ircmsg" + (props.isFocused ? "--focused" : "")}
      tabIndex={0}
    >
      <p>
        <i>
          <b $HasVNodeChildren>{createTextVNode(`<${props.sender}>`)}</b>
          {" " + props.text}
        </i>
      </p>
    </div>
  );
}

function IRCLikeMessageItemUnknown(props) {
  return (
    <div
      className={"ircmsg" + (props.isFocused ? "--focused" : "")}
      tabIndex={0}
    >
      <p>Unsupported message type was sent from {props.sender}</p>
    </div>
  );
}

function IRCLikeMessageItem(props) {
  const { sender, content, isFocused } = props;
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
          notice={content.body}
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
