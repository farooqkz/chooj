import { createTextVNode } from "inferno";
import "./IRCLikeMessageItem.css";
import {
  mxcMediaToHttp,
  bytesToHigherScale,
  msToHigherScale,
  readableTimestamp
} from "../../utils";

function IRCLikeMessageItemText({ date, text, sender, isFocused }) {
  return (
    <div className={"ircmsg" + (isFocused ? "--focused" : "")} tabIndex={0}>
      <p>
        <b $HasTextChildren>{date}</b>
        <b $HasTextChildren>{`<${sender}>`}</b>
        {createTextVNode(" " + text)}
      </p>
    </div>
  );
}

function IRCLikeMessageItemNotice({ date, isFocused, text, sender }) {
  return (
    <div className={"ircmsg" + (isFocused ? "--focused" : "")} tabIndex={0}>
      <p>
        <i>
          <b $HasTextChildren>{date}</b>
          <b $HasTextChildren>{`<${sender}>`}</b>
          {createTextVNode(" " + text)}
        </i>
      </p>
    </div>
  );
}

function IRCLikeMessageItemImage({
  date,
  sender,
  text,
  width,
  height,
  size,
  url,
  isFocused,
}) {
  while (height > (192 * 2) / 3) {
    height *= 0.75;
    width *= 0.75;
  }
  while (width > (238 * 2) / 3) {
    height *= 0.75;
    width *= 0.75;
  }
  url = window.mClient.mxcUrlToHttp(url, width, height, "scale", true);
  return (
    <div className={"ircmsg" + (isFocused ? "--focused" : "")} tabIndex={0}>
      <p>
        <b $HasTextChildren>{date}</b>
        <b $HasTextChildren>{`<${sender}>`}</b>
        {createTextVNode(text)}
        <img width={width} height={height} src={url} alt={text} />
      </p>
    </div>
  );
}

function IRCLikeMessageItemAudio({
  date,
  isFocused,
  sender,
  size,
  duration,
  url,
  text,
}) {
  const hsUrl = window.mClient.getHomeserverUrl();
  url = mxcMediaToHttp(hsUrl, url);
  return (
    <div className={"ircmsg" + (isFocused ? "--focused" : "")} tabIndex={0}>
      <p>
        <b $HasTextChildren>{date}</b>
        <b $HasTextChildren>{`${sender} has sent an audio clip.`}</b>
        <br />
        Title: {createTextVNode(text)}
        <br />
        Duration: {createTextVNode(msToHigherScale(duration))}
        <br />
        Size: {createTextVNode(bytesToHigherScale(size))}
        <audio src={url} autoplay={false} />
      </p>
    </div>
  );
}

function IRCLikeMessageItemUnknown({ date, isFocused, sender }) {
  return (
    <div className={"ircmsg" + (isFocused ? "--focused" : "")} tabIndex={0}>
      <b $HasTextChildren>{date}</b>
      <p $HasTextChildren>Unsupported message type was sent from {sender}</p>
    </div>
  );
}

function IRCLikeMessageItem({ date, sender, content, isFocused }) {
  const userId = sender.userId;
  let userObj = window.mClient.getUser(userId);
  let displayName = (userObj && userObj.displayName) || userId;
  // In matrix-js-sdk 15.1.1 sometimes getUser(...) returns null. This is a temporary workaround.
  let d = readableTimestamp(date);
  switch (content.msgtype) {
    case "m.text":
      return (
        <IRCLikeMessageItemText
          date={d}
          sender={displayName}
          text={content.body}
          isFocused={isFocused}
        />
      );
    case "m.notice":
      return (
        <IRCLikeMessageItemNotice
          date={d}
          sender={displayName}
          text={content.body}
          isFocused={isFocused}
        />
      );
    case "m.image":
      return (
        <IRCLikeMessageItemImage
          date={d}
          sender={displayName}
          text={content.body}
          width={content.info.w}
          height={content.info.h}
          size={content.info.size}
          url={content.url}
          isFocused={isFocused}
        />
      );
    case "m.audio":
      return (
        <IRCLikeMessageItemAudio
          date={d}
          sender={displayName}
          text={content.body}
          duration={content.info.duration}
          size={content.info.size}
          url={content.url}
          isFocused={isFocused}
        />
      );
    case "m.emote":
    case "m.video":
    case "m.location":
    case "m.file":
    default:
      return (
        <IRCLikeMessageItemUnknown
          date={d}
          sender={sender.userId}
          isFocused={isFocused}
        />
      );
  }
}

export default IRCLikeMessageItem;
