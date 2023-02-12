import "KaiUI/src/views/ListView/ListView.scss";
import { Component } from "inferno";
import { findDOMNode } from "inferno-extras";

class ListView extends Component {
  handleKeyDown = (evt) => {
    let cursor = this.state.cursor;
    const { children, cursorChangeCb, captureKeys } = this.props;

    if (captureKeys instanceof Array && captureKeys.includes(evt.key)) {
      evt.stopImmediatePropagation();
    }
    if (evt.key === "ArrowUp") {
      cursor--;
      if (cursor === -1) cursor = children.length - 1;
      if (children[cursor] && children[cursor].props.unFocusable) cursor--;
      if (cursor === -1) cursor = children.length - 1;
      // TODO: summarize all of these three "if"s
    } else if (evt.key === "ArrowDown") {
      cursor++;
      if (cursor >= children.length) cursor = 0;
      if (children[cursor] && children[cursor].props.unFocusable) cursor++;
      if (cursor >= children.length) cursor = 0;
      // TODO: same as above! ME LAZY Farooq
    }
    if (children && children[cursor])
      findDOMNode(children[cursor]).scrollIntoView();
    this.setState({
      cursor: cursor,
    });
    cursorChangeCb && cursorChangeCb(cursor);
  };

  constructor(props) {
    super(props);
    const { children, cursor, cursorChangeCb } = props;
    if (cursor - 1 > children.length || cursor < 0) {
      console.error(
        `[ListView] cursor should be from 0 to ${
          children.length - 1
        } but is ${cursor}`
      );
      throw new Error("cursor is negative or bigger than length of list");
    }
    if (cursorChangeCb) cursorChangeCb(cursor);
    this.state = {
      cursor: cursor,
    };
    console.log(props.capture);
  }

  componentDidUpdate() {
    const { cursor, children } = this.props;
    findDOMNode(children[cursor]).scrollIntoView();
  }

  componentDidMount() {
    document.addEventListener(
      "keydown",
      this.handleKeyDown,
      Boolean(this.props.capture)
    );
  }

  componentWillUnmount() {
    document.removeEventListener(
      "keydown",
      this.handleKeyDown,
      Boolean(this.props.capture)
    );
  }

  render() {
    const { height, children } = this.props;
    return (
      <div
        className={"kai-list-view"}
        style={{
          height: height || "calc(100vh - 60px)",
        }}
      >
        {children}
      </div>
    );
  }
}

export default ListView;
