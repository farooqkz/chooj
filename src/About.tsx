import { Component, createPortal, VNode } from "inferno";
import {
  ListViewKeyed,
  IconListItem,
  TextListItem,
  Separator,
  DropDownMenu
} from "KaiUI";

import FarooqAvatar from "./FarooqAvatar.png";
import { startDM } from "./utils"; // eslint-disable-line no-unused-vars

interface ContactSelectionMenuProps {
  selectCb: (label: string) => void;
}

function ContactSelectionMenu({ selectCb }: ContactSelectionMenuProps) : JSX.Element {
  return (
    <DropDownMenu
      title="Contact Farooq"
      selectCb={selectCb}
      labels={["email", "matrix"]}
    >
      <TextListItem primary="Email" />
      <TextListItem primary="Matrix" />
    </DropDownMenu>
  );
}

function contactFarooq(contactWay: string) {
  // eslint-disable-next-line no-useless-concat
  let myEmailAddr = "mailto:" + "f" + "kz" + "@" + "riseup.net";
  switch (contactWay) {
    case "email":
      // eslint-disable-next-line no-undef
      let mail = new MozActivity({
        name: "view",
        data: {
          type: "url",
          url: myEmailAddr,
        },
      });
      mail.onerror = (error) =>
        console.log("MozActivity", error) &&
        window.alert("Cannot start Email app :(");
      break;
    default:
      window.alert("Not implemented yet...");
      break;
  }
}


interface AboutState {
  showContactScreen: Boolean;
}

class About extends Component<{}, AboutState> {
  handleKeyDown = (evt: KeyboardEvent) => {
    if (evt.key === "Call" || evt.key === "c") {
      console.log("Okay they want to contact Farooq...");
      this.setState({ showContactScreen: true });
    }
    if (evt.key === "Backspace" || evt.key === "b") {
      if (this.state.showContactScreen) {
        evt.preventDefault();
        this.setState({ showContactScreen: false });
      }
    }
  };

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  constructor() {
    super();
    this.state = {
      showContactScreen: false,
    };
  }

  render() {
    let items = [
      <TextListItem key="call-Farooq" tertiary="Press Call button while in this Tab to contact Farooq the developer of this app" />,
      <IconListItem
        key="dev-Farooq"
        iconSrc={FarooqAvatar}
        primary="Farooq Karimi Zadeh"
        secondary="Main app developer"
      />,
      <TextListItem key="dev-Affe" primary="Affe Null" secondary="Contributor" />,
      <TextListItem key="dev-slaux" primary="Simon Laux" secondary="Contributor" />,
      <Separator key="sep-lib" text="Major libraries" />,
      <TextListItem key="lib-matrix" primary="matrix-js-sdk" />,
      <TextListItem key="lib-kaiuing" primary="KaiUIng" />,
      <TextListItem key="lib-inferno" primary="InfernoJS" />,
      <TextListItem key="lib-localforage" primary="localforage" />,

    ];
    return (
      <>
        <ListViewKeyed
          cursor={0}
          $HasKeyedChildren
        >
          {items}
        </ListViewKeyed>
        {this.state.showContactScreen
          ? createPortal(
              <ContactSelectionMenu
                selectCb={(selection) => {
                  this.setState({ showContactScreen: false });
                  contactFarooq(selection);
                }}
              />,
              document.querySelector("#menu")
            )
          : null}
      </>
    );
  }
}

export default About;
