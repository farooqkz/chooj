import { Component } from "inferno";
import ListView from "./ListView";
import TextListItem from "./ui/TextListItem";
import Header from "./ui/Header";
import SoftKey from "./ui/SoftKey";

class RoomView extends Component {
  cursorChangeCb = (cursor) => {
    this.setState({ cursor: cursor });
  };

  constructor(props) {
    super(props);
    this.room = window.mClient.getRoom(props.roomId);
    this.state = {
      showMenu: false,
      cursor: 0,
    };
  }

  render() {
    return (
      <>
        <Header text="RoomNameHERE" />
        <ListView
          cursor={this.state.cursor}
          cursorChangeCb={this.cursorChangeCb}
        >
          {this.room
            .getLiveTimeline()
            .getEvents()
            .map((evt, index) => {
              let item = (
                <TextListItem
                  primary={evt.getSender()}
                  secondary={evt.getContent().toString()}
                  tertiary={evt.getDate().toString()}
                />
              );
              item.props.isFocused = index === this.state.cursor;
              return item;
            })}
        </ListView>
        <footer $HasVNodeChildren>
          <SoftKey />
        </footer>
      </>
    );
  }
}

export default RoomView;
