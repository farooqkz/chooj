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
    const { title, selectCb, children } = this.props;
    const listViewHeight = children.length * 6 + 1 + (window.isFullScreen? 0 : 2);
    return (
      <div
        style={{
          "min-height": `calc(100vh - ${
            children.length * 6 - (window.isFullScreen ? 0 : 2)
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
        <Header text={title} />
        <ListView
          cursorChangeCb={(cursor) => this.setState({ cursor: cursor })}
          cursor={this.state.cursor}
          height={listViewHeight.toString() + "rem"}
        >
          {children.map((item, index) => {
            item.props.isFocused = index === this.state.cursor;
            return item;
          })}
        </ListView>
        <SoftKey
          centerText="Select"
          centerCb={() => selectCb(this.state.cursor)}
        />
      </div>
    );
  }
}

export default DropDownMenu;
