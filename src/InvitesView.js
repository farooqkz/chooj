import { Component } from "inferno";
import ListView from "ListView";

class InvitesView extends Component {
  getInvite = (room) => room.getMyMembership() === "invite";
  constructor(props) {
    super(props);
    this.invites = window.mClient.getRooms().filter(this.getInvite);
    this.state = {
      cursor: 0,
    };
  }

  render() {
    // TODO
  }
}

export default InvitesView;
