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

function IRCLikeMessageItemImage({
  sender,
  text,
  width,
  height,
  size,
  url,
  isFocused
}) {
  while (height > (192 * 2/3)) {
    height *= 0.75;
    width *= 0.75;
  }
  while (width > (238 * 2/3)) {
    height *= 0.75;
    width *= 0.75;
  }
  url = window.mClient.mxcUrlToHttp(url, width, height, "scale", true);
  return (
    <div className={"ircmsg" + (isFocused ? "--focused" : "")} tabIndex={0}>
      <p>
        <b $HasTextChildren>{`<${sender}>`}</b>
        {createTextVNode(text)}
        <img width={width} height={height} src={url} alt={text} />
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
    case "m.image":
      return (
        <IRCLikeMessageItemImage
          sender={displayName}
          text={content.body}
          width={content.info.w}
          height={content.info.h}
          size={content.info.size}
          url={content.url}
          isFocused={isFocused}
        />
      );
    case "m.emote":
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
