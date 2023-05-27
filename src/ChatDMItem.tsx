import { Component } from "inferno";
import { Avatar, IconListItem } from "KaiUI";
import { Room, RoomEvent, User, UserEvent, MatrixEvent } from "matrix-js-sdk";
import personIcon from "./person_icon.png";
import { makeHumanReadableEvent, getRoomLastEvent, getAvatarOrDefault } from "./utils";


interface ChatDMItemState {
  displayName: string;
  avatarUrl: string;
  presence: string;
  lastEvent: string;
  lastActiveAgo: number;
}

interface ChatDMItemProps {
  room: Room;
}

export default class ChatDMItem extends Component<ChatDMItemProps, ChatDMItemState> {
  updateDisplayName = (_evt: MatrixEvent | undefined, user: User) => {
    this.setState((state: ChatDMItemState) => {
      state.displayName = user.displayName || state.displayName;
      return state;
    });
  };

  updateAvatar = (_evt: MatrixEvent | undefined, user: User) => {
    this.setState((state: ChatDMItemState) => {
      state.avatarUrl = user.avatarUrl || state.avatarUrl;
      return state;
    });
  };

  updatePresence = (_evt: MatrixEvent | undefined, user: User) => {
    this.setState((state: ChatDMItemState) => {
      state.presence = user.presence || state.presence;
      return state;
    });
  };

  updateTimeline = (evt: MatrixEvent, _room: Room) => { 
    this.setState({
      lastEvent: makeHumanReadableEvent(evt, true)
    });
  }

  constructor(props: ChatDMItemProps) {
    super(props);
    let user = window.mClient.getUser(props.room.guessDMUserId());
    this.state = {
      presence: user.presence,
      lastActiveAgo: user.lastActiveAgo,
      avatarUrl: user.avatarUrl,
      displayName: user.displayName,
      lastEvent: makeHumanReadableEvent(getRoomLastEvent(props.room), true),
    };
  }

  componentDidMount() {
    let user: User = window.mClient.getUser(this.props.room.guessDMUserId());
    user.on(UserEvent.Presence, this.updatePresence);
    user.on(UserEvent.AvatarUrl, this.updateAvatar);
    user.on(UserEvent.DisplayName, this.updateDisplayName);
    this.props.room.on(RoomEvent.Timeline, this.updateTimeline);
  }

  componentWillUnmount() {
    let user: User = window.mClient.getUser(this.props.room.guessDMUserId());
    user.off(UserEvent.Presence, this.updatePresence);
    user.off(UserEvent.AvatarUrl, this.updateAvatar);
    user.off(UserEvent.DisplayName, this.updateDisplayName);
    this.props.room.off(RoomEvent.Timeline, this.updateTimeline);
  }

  render() {
    const { presence, displayName, avatarUrl } = this.state;
    let avatar = getAvatarOrDefault(avatarUrl, personIcon);
    let lastEvent = this.state.lastEvent;
    if (lastEvent.length >= 33) lastEvent = lastEvent.slice(0, 33) + "...";

    return (
      <IconListItem
        icon={<Avatar avatar={avatar} online={presence} />}
        secondary={displayName}
        primary={lastEvent}
      />
    );
  }
}
