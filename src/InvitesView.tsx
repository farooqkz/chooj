import { Component } from "inferno";
import { Room } from "matrix-js-sdk";
/*
import {
  ListView,
  TextListItem,
} from "KaiUI";
*/
import NoItem from "./NoItem";

interface InvitesViewState {
  cursor: number;
}

interface InvitesViewProps {
  selectedInviteCb: (invite: Room) => void;
}

class InvitesView extends Component<InvitesViewProps, InvitesViewState> {
  getInvite = (room: Room) => room.getMyMembership() === "invite";
  constructor(props: InvitesViewProps) {
    super(props);
    this.state = {
      cursor: 0,
    };
  }

  cursorChangeCb = (cursor: number) => {
    //this.props.selectedInviteCb(this.invites[cursor]);
    this.setState({ cursor: cursor });
  };

  render() {
    return <NoItem text="Invites not implemented yet" />;
    /*
    return (
      <ListView cursorChangeCb={this.cursorChangeCb} cursor={this.state.cursor}>
        <TextListItem primary="Hello :)" focused />
      </ListView>
    );
    */
  }
}

export default InvitesView;
