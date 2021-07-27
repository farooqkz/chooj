import ListView from "./ListView";
import Header from "./ui/Header";
import SoftKey from "./ui/SoftKey";
import { Component } from "inferno";

class DropDownMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cursor: 0,
    };
  }

  render() {
    return (
      <div
        style={{
          "min-height": `calc(100vh - ${
            this.props.children.length * 6
          }rem - 1.6rem)`,
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          top: "auto",
          "z-index": 9999,
          width: "100%",
        }}
      >
        <Header text={this.props.title} />
        <ListView
          cursorChangeCb={(cursor) => this.setState({ cursor: cursor })}
          cursor={this.state.cursor}
        >
          {this.props.children.map((item, index) => {
            if (index === this.state.cursor) {
              item.props.isFocused = true;
            } else {
              item.props.isFocused = false;
            }
            return item;
          })}
        </ListView>
        <SoftKey
          centerText="Select"
          centerCb={() => this.props.selectCb(this.state.cursor)}
        />
      </div>
    );
  }
}

export default DropDownMenu;
