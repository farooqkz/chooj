import Avatar from "./Avatar";
import IconListItem from "./ui/IconListItem";

function ChatDMItem({ isFocused, avatar, online, displayName, lastEvent }) {
  if (lastEvent.length >= 33) lastEvent = lastEvent.slice(0, 33) + "...";
  return (
    <IconListItem
      icon=<Avatar avatar={avatar} online={online} />
      secondary={displayName}
      primary={lastEvent}
      isFocused={isFocused}
    />
  );
}

export default ChatDMItem;
