import { Component } from "inferno";
import { Room, RoomMember, MatrixEvent, RoomMemberEvent } from "matrix-js-sdk";
import {
  ListViewKeyed,
  TextListItem,
} from "KaiUI";
import NoItem from "./NoItem";
import shared from "./shared";
import { getInvite, getRoomsByPredicate } from "./utils";


interface InvitesViewProps {
  selectedInviteCb: (invite: Room | null) => void;
}

class InvitesView extends Component<InvitesViewProps, {}> {
  private invites: Room[];

  onMembershipChange = (_evt: MatrixEvent, member: RoomMember) => {
    if (member.membership === "invite" && member.userId === shared.mClient.getUserId()) {
      let room: Room | null = shared.mClient.getRoom(member.roomId);
      if (room) {
        this.invites.push(room);
        this.forceUpdate();
      }
    }
  };

  constructor(props: InvitesViewProps) {
    super(props);
    this.invites = getRoomsByPredicate(getInvite);
  }
  
  componentWillUnmount() {
    shared.mClient.off(RoomMemberEvent.Membership, this.onMembershipChange);
  }

  componentDidMount() {
    shared.mClient.on(RoomMemberEvent.Membership, this.onMembershipChange);
  }

  cursorChangeCb = (cursor: number) => {
    this.props.selectedInviteCb(this.invites[cursor]);
  };

  render() {
    if (this.invites.length === 0) {
      this.props.selectedInviteCb(null);
      return <NoItem text="No one has invited you, yet" />;
    } else {
      return (
        <ListViewKeyed cursorChangeCb={this.cursorChangeCb} cursor={0}>
          { this.invites.map((room: Room) => <TextListItem primary={room.name} key={room.roomId} />) }
        </ListViewKeyed>
      );
    }
  }
}

export default InvitesView;
