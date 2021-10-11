import "KaiUI/src/views/ListView/ListView.scss";
import { Component } from "inferno";
import { findDOMNode } from "inferno-extras";

class ListView extends Component {
  handleKeyDown = (evt) => {
    let cursor = this.state.cursor;
    const props = this.props;
    if (evt.key === "ArrowUp") {
      cursor--;
      if (cursor === -1) cursor = this.props.children.length - 1;
      if (props.children[cursor] && props.children[cursor].props.unFocusable)
        cursor--;
      if (cursor === -1) cursor = this.props.children.length - 1;
      // TODO: summarize all of these three "if"s
    } else if (evt.key === "ArrowDown") {
      cursor++;
      if (cursor >= this.props.children.length) cursor = 0;
      if (props.children[cursor] && props.children[cursor].props.unFocusable)
        cursor++;
      if (cursor >= this.props.children.length) cursor = 0;
      // TODO: same as above! ME LAZY Farooq
    }
    if (props.children && props.children[cursor])
      findDOMNode(props.children[cursor]).scrollIntoView();
    this.setState({
      cursor: cursor,
    });
    props.cursorChangeCb && props.cursorChangeCb(cursor);
  };

  constructor(props) {
    super(props);
    const { cursor, cursorChangeCb } = props;
    console.log(`[ListView] Constructor was called: cursor=${cursor}`);
    if (cursor - 1 > this.props.children.length || cursor < 0) {
      console.error(
        `[ListView] cursor should be from 0 to ${
          this.props.children.length - 1
        } but is ${cursor}`
      );
      throw new Error("cursor is negative or bigger than length of list");
    }
    if (cursorChangeCb) cursorChangeCb(cursor);
    this.state = {
      cursor: cursor,
    };
  }

  componentDidUpdate() {
    //findDOMNode(this.props.children[this.props.cursor]).scrollIntoView();
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  render() {
    return (
      <div
        className={"kai-list-view"}
        style={{
          position: "fixed",
          height: this.props.height || "calc(100vh - 60px)",
        }}
      >
        {this.props.children}
      </div>
    );
  }
}

export default ListView;
