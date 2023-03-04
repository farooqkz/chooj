import { Component, createPortal } from "inferno";
import {
  ListView,
  IconListItem,
  TextListItem,
  Separator,
  DropDownMenu
} from "KaiUI";

import FarooqAvatar from "./FarooqAvatar.png";
import AdrianAvatar from "./AdrianAvatar.png";
import { startDM } from "./utils"; // eslint-disable-line no-unused-vars

function ContactSelectionMenu({ selectCb }) {
  return (
    <DropDownMenu
      title="Contact Farooq"
      selectCb={(cursor) => selectCb(["email", "matrix"][cursor])}
    >
      <TextListItem primary="Email" />
      <TextListItem primary="Matrix" />
    </DropDownMenu>
  );
}

function contactFarooq(contactWay) {
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

class About extends Component {
  handleKeyDown = (evt) => {
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

  constructor(props) {
    super(props);
    this.state = {
      cursor: 0,
      showContactScreen: false,
    };
  }

  render() {
    let items = [
      <TextListItem key="call-Farooq" tertiary="Press Call button while in this Tab to contact Farooq the developer of this app" isFocused={0 === this.state.cursor} />,
      <IconListItem
        key="dev-Farooq"
        iconSrc={FarooqAvatar}
        primary="Farooq Karimi Zadeh"
        secondary="App Developer" isFocused={1 === this.state.cursor}
      />,
      <TextListItem key="dev-Affe" primary="Affe Null" secondary="Contributor"  isFocused={2 === this.state.cursor} />,
      <Separator key="sep-lib" text="Libraries and modules"  isFocused={3 === this.state.cursor} />,
      <IconListItem
        key="lib-kaiui"
        iconSrc={AdrianAvatar}
        primary="Adrian Machado"
        secondary="KaiUI"  isFocused={4 === this.state.cursor}
      />,
      <TextListItem key="lib-matrix" primary="matrix.org" secondary="matrix-js-sdk"  isFocused={5 === this.state.cursor} />,
    ];
    return (
      <>
        <ListView
          cursor={this.state.cursor}
          cursorChangeCb={(cursor) => this.setState({ cursor: cursor })}
        >
        {items}
        </ListView>
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
