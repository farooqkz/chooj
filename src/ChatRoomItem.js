import Avatar from "./Avatar/Avatar";
import IconListItem from "./ui/IconListItem";

function ChatRoomItem({ avatar, isFocused, lastEvent, displayName }) {
  if (lastEvent.length >= 33) 
    lastEvent = lastEvent.slice(0, 33) + "...";
  return (
    <IconListItem
      icon=<Avatar avatar={avatar} />
      secondary={displayName}
      primary={lastEvent}
      isFocused={isFocused}
    />
  );
}

export default ChatRoomItem;
