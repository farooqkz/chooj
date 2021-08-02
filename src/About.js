import { Component, createPortal } from "inferno";
import ListView from "./ListView";
import IconListItem from "./ui/IconListItem";
import TextListItem from "./ui/TextListItem";
import Separator from "./ui/Separator";
import FarooqAvatar from "./FarooqAvatar.png";
import AdrianAvatar from "./AdrianAvatar.png";
import DropDownMenu from "./DropDownMenu";
import { startDM } from "./utils"; // eslint-disable-line no-unused-vars

function ContactSelectionMenu(props) {
  return (
    <DropDownMenu
      title="Contact Farooq"
      selectCb={(cursor) => props.selectCb(["email", "matrix"][cursor])}
    >
      <TextListItem primary="Email" />
      <TextListItem primary="Matrix" />
    </DropDownMenu>);
}

function contactFarooq(contactWay) {
  // eslint-disable-next-line no-useless-concat
  let myEmailAddr = "mailto:" + "f" + "kz" + "@" + "riseup.net";
  switch (contactWay) {
    case "email":
      let mail = new MozActivity({ // eslint-disable-line no-undef
        name: "view",
        data: {
          type: "url",
          url: myEmailAddr,
        }
      });
      mail.onerror = (error) => console.log("MozActivity", error) && window.alert("Cannot start Email app :(");
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
        <TextListItem tertiary="Press Call button while in this Tab to contact Farooq the developer of this app" />,
        <IconListItem
          iconSrc={FarooqAvatar}
          primary="Farooq Karimi Zadeh"
          secondary="App Developer" />,
        <Separator text="Libraries and modules" />,
        <IconListItem
          iconSrc={AdrianAvatar}
          primary="Adrian Machado"
          secondary="KaiUI" />,
        <TextListItem
          primary="matrix.org"
          secondary="matrix-js-sdk" />
    ];
    return (<>
      <ListView
        cursor={this.state.cursor}
        cursorChangeCb={(cursor) => this.setState({ cursor: cursor })}>
        {items.map((item, index) => {
          item.props.isFocused = index === this.state.cursor;
          return item;
        })}
      </ListView>
      {
        this.state.showContactScreen?
          createPortal(
            <ContactSelectionMenu selectCb={(selection) => { this.setState({ showContactScreen: false }); contactFarooq(selection); }} />,
            document.querySelector("#menu")):null
      }
    </>);
  }
}

export default About;
