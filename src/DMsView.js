import { Component } from "inferno";
import * as matrixcs from "matrix-js-sdk";

import ListView from "./ListView";
import personIcon from "./person_icon.png";
import ChatDMItem from "./ChatDMItem";
import TextListItem from "./ui/TextListItem";

const AVATAR_WIDTH = 36;
const AVATAR_HEIGHT = 36;

class DMsView extends Component {
  handleKeyDown = (evt) => {
    if (evt.key === "Call" || evt.key === "c") {
      // 1. show a dialog to select call type
      // 2. start a call
    }
  };

  cursorChangeCb = (cursor) => {
    this.setState({ cursor: cursor });
  };
  
  getDMs = (room) =>
    room.getJoinedMemberCount() === 2 && room.getMyMembership() === "join";
  constructor(props) {
    super(props);
    this.rooms = [];
    this.state = {
      cursor: 0,
    };
  }

  componentWillMount() {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  render() {
    const rooms = window.mClient.getVisibleRooms().filter(this.getDMs);
    let renderedRooms = rooms.map((room) => {
      let theOtherId = room.guessDMUserId();
      let mxcUrl = window.mClient.getUser(theOtherId).avatarUrl;
      let avatarUrl;
      if (mxcUrl) {
        avatarUrl = matrixcs.getHttpUriForMxc(
          window.mClient.getHomeserverUrl(),
          mxcUrl,
          AVATAR_WIDTH,
          AVATAR_HEIGHT,
          "scale",
          true
        );
      } else {
        avatarUrl = personIcon;
      }
      return <ChatDMItem userId={theOtherId} avatar={avatarUrl} />;
    });

    if (renderedRooms.length === 0) {
      renderedRooms.push(<TextListItem primary="No DM :(" />);
    }
    return (
      <ListView cursor={this.state.cursor} cursorChangeCb={this.cursorChangeCb}>
        {renderedRooms}
      </ListView>
    );
  }
}

export default DMsView;
