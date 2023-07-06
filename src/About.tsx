import { Component } from "inferno";
import {
  ListViewKeyed,
  IconListItem,
  TextListItem,
  Button,
  Separator
} from "KaiUI";
import shared from "./shared";
import { Room, ClientEvent } from "matrix-js-sdk";
import { RoomsViewState } from "./types";
import { toast } from "./utils";

import FarooqAvatar from "./FarooqAvatar.png";

const choojRoom = "#chooj:mozilla.org";

function joinChoojRoom() {
  shared.mClient.joinRoom(choojRoom).then((room: Room) => {
    shared.mClient.once(ClientEvent.Sync, () => {
      let state: RoomsViewState | undefined = shared.stateStores.get("RoomsView");
      state?.rooms.push(room);
      state && shared.stateStores.set("RoomsView", state);
      toast("Joined!", 1000); 
    });
  }).catch((e: any) => {
    window.alert("Some error occured during joining:" + e.toString());
    console.log("some error occured during joining", e);
  });
}

class About extends Component<{}, {}> {
  public state: null = null;
  handleKeyDown = (evt: KeyboardEvent) => {
    if (evt.key === "Call" || evt.key === "c") {
      console.log("Okay they want to contact Farooq...");
      let myEmailAddr = "mailto:" + "f" + "kz" + "@" + "riseup.net";
      let mail = new MozActivity({
        name: "view",
        data: {
          type: "url",
          url: myEmailAddr,
        },
      });
      mail.onerror = (error: any) => {
        console.log("MozActivity", error);
        window.alert("Cannot start Email app :(");
      };
    }
  };

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  constructor(props: any) {
    super(props);
  }

  render() {
    let items = [
      <TextListItem
        key="call-Farooq"
        tertiary="Press Call button while in this tab to contact Farooq the developer of this app"
      />,
      <Button
        key="join-btn"
        text="Join our chatroom" 
        onClick={joinChoojRoom}
      />,
      <IconListItem
        key="dev-Farooq"
        iconSrc={FarooqAvatar}
        secondary="Farooq Karimi Zadeh"
        primary="Main app developer"
      />,
      <TextListItem
        key="dev-Affe"
        primary="Affe Null"
        secondary="Contributor"
      />,
      <TextListItem
        key="dev-slaux"
        primary="Simon Laux"
        secondary="Contributor"
      />,
      <Separator key="sep-lib" text="Major libraries" />,
      <TextListItem key="lib-matrix" primary="matrix-js-sdk" />,
      <TextListItem key="lib-kaiuing" primary="KaiUIng" />,
      <TextListItem key="lib-inferno" primary="InfernoJS" />,
      <TextListItem key="lib-localforage" primary="localforage" />,
    ];
    return (
      <>
        <ListViewKeyed cursor={0} $HasKeyedChildren>
          {items}
        </ListViewKeyed>
      </>
    );
  }
}

export default About;
