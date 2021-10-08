import { Component } from "inferno";
import ListView from "./ListView";
import TextListItem from "./ui/TextListItem";

class InvitesView extends Component {
  getInvite = (room) => room.getMyMembership() === "invite";
  constructor(props) {
    super(props);
    this.invites = window.mClient.getRooms().filter(this.getInvite);
    this.state = {
      cursor: 0,
    };
  }

  cursorChangeCb = (cursor) => {
    this.props.selectedInviteCb(this.invites[cursor]);
    this.setState({ cursor: cursor });
  };

  render() {
    console.log(this.invites[0]);
    return (<ListView cursorChangeCb={this.cursorChangeCb} cursor={this.state.cursor}>
                <TextListItem primary="Hello :)" focused/>
      </ListView>);
            
  }
}

export default InvitesView;
