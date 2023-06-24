import { createTextVNode } from "inferno";
import classNames from "classnames";
import { IContent } from "matrix-js-sdk";
import "./IRCLikeMessageItem.css";
import {
  mxcMediaToHttp,
  bytesToHigherScale,
  msToHigherScale,
  getSomeDisplayName,
} from "../../utils";

interface Sender {
  userId: string;
}

interface IRCLikeMessageItemCommonProps {
  readableTs: string;
  isFocused: boolean;
  status: string | null;
}

interface IRCLkeMessageItemProps {
  content: IContent;
  sender: Sender;
}

interface IRCLikeMessageItemTextProps {
  text: string; 
  sender: string;
}

interface IRCLikeMessageItemImageProps {
  width: number;
  height: number;
  url: string;
  sender: string;
  size: number;
}

interface IRCLikeMessageItemAudioProps {
  duration: number;
  url: string;
  size: number;
  sender: string;
}

interface IRCLikeMessageItemUnknownProps {
  sender: string;
}

function getClassNameFromStatus(status: null | string) : string {
  if (status === null) return "";
  if (status === "not_sent") {
    return "not_sent";
  } else if (status === "sent") {
    return "";
  } else {
    return "sending";
  }
}

function IRCLikeMessageItemText({ readableTs, text, sender, isFocused, status }: IRCLikeMessageItemCommonProps & IRCLikeMessageItemTextProps) {
  return (
    <div className={classNames("ircmsg" + (isFocused ? "--focused" : ""), getClassNameFromStatus(status))} tabIndex={0}>
      <p>
        <b $HasTextChildren>{readableTs}</b>
        <b $HasTextChildren>{`<${sender}>`}</b>
        {createTextVNode(" " + text)}
      </p>
    </div>
  );
}

function IRCLikeMessageItemNotice({ readableTs, isFocused, text, sender, status }: IRCLikeMessageItemCommonProps & IRCLikeMessageItemTextProps) {
  return (
    <div className={classNames("ircmsg" + (isFocused ? "--focused" : ""), getClassNameFromStatus(status))} tabIndex={0}>
      <p>
        <i>
          <b $HasTextChildren>{readableTs}</b>
          <b $HasTextChildren>{`<${sender}>`}</b>
          {createTextVNode(" " + text)}
        </i>
      </p>
    </div>
  );
}

function IRCLikeMessageItemImage({
  readableTs,
  sender,
  text,
  width,
  height,
  url,
  isFocused,
  status,
}: IRCLikeMessageItemTextProps & IRCLikeMessageItemImageProps & IRCLikeMessageItemCommonProps) {
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
    <div className={classNames("ircmsg" + (isFocused ? "--focused" : ""), getClassNameFromStatus(status))} tabIndex={0}>
      <p>
        <b $HasTextChildren>{readableTs}</b>
        <b $HasTextChildren>{`<${sender}>`}</b>
        {createTextVNode(text)}
        <img width={width} height={height} src={url} alt={text} />
      </p>
    </div>
  );
}

function IRCLikeMessageItemAudio({
  readableTs,
  isFocused,
  sender,
  size,
  duration,
  url,
  text,
  status,
}: IRCLikeMessageItemCommonProps & IRCLikeMessageItemAudioProps & IRCLikeMessageItemTextProps) {
  const hsUrl = window.mClient.getHomeserverUrl();
  url = mxcMediaToHttp(hsUrl, url);
  return (
    <div className={classNames("ircmsg" + (isFocused ? "--focused" : ""), getClassNameFromStatus(status))} tabIndex={0}>
      <p>
        <b $HasTextChildren>{readableTs}</b>
        <b $HasTextChildren>{`${sender} has sent an audio clip.`}</b>
        <br />
        Title: {createTextVNode(text)}
        <br />
        Duration: {createTextVNode(msToHigherScale(duration))}
        <br />
        Size: {createTextVNode(bytesToHigherScale(size))}
        <audio src={url} autoPlay={false} />
      </p>
    </div>
  );
}

function IRCLikeMessageItemUnknown({ readableTs, isFocused, sender, status }: IRCLikeMessageItemCommonProps & IRCLikeMessageItemUnknownProps) {
  return (
    <div className={classNames("ircmsg" + (isFocused ? "--focused" : ""), getClassNameFromStatus(status))} tabIndex={0}>
      <b $HasTextChildren>{readableTs}</b>
      <p $HasTextChildren>Unsupported message type was sent from {sender}</p>
    </div>
  );
}

function IRCLikeMessageItem({ readableTs, sender, content, isFocused, status }: IRCLikeMessageItemCommonProps & IRCLkeMessageItemProps) {
  const userId = sender.userId;
  let displayName = getSomeDisplayName(userId);
  // In matrix-js-sdk 15.1.1 sometimes getUser(...) returns null. This is a temporary workaround.

  switch (content.msgtype) {
    case "m.text":
      return (
        <IRCLikeMessageItemText
          readableTs={readableTs}
          sender={displayName}
          text={content.body}
          status={status}
          isFocused={isFocused}
        />
      );
    case "m.notice":
      return (
        <IRCLikeMessageItemNotice
          readableTs={readableTs}
          sender={displayName}
          text={content.body}
          status={status}
          isFocused={isFocused}
        />
      );
    case "m.image":
      return (
        <IRCLikeMessageItemImage
          readableTs={readableTs}
          sender={displayName}
          text={content.body}
          width={content.info.w}
          height={content.info.h}
          size={content.info.size}
          url={content.url}
          status={status}
          isFocused={isFocused}
        />
      );
    case "m.audio":
      return (
        <IRCLikeMessageItemAudio
          readableTs={readableTs}
          sender={displayName}
          text={content.body}
          duration={content.info.duration}
          size={content.info.size}
          url={content.url.content_uri}
          status={status}
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
          readableTs={readableTs}
          sender={sender.userId}
          status={status}
          isFocused={isFocused}
        />
      );
  }
}

export default IRCLikeMessageItem;
