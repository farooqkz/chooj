import { Component } from "inferno";
import { findDOMNode } from "inferno-extras";
import "KaiUI/src/components/Tabs/Tabs.scss";

const prefixCls = "kai-tabs";

class Tabs extends Component {
  handleKeyDown = (evt) => {
    if (!["ArrowLeft", "ArrowRight"].includes(evt.key)) return;
    const { children, onChangeIndex } = this.props;
    let index = this.state.activeChild;
    console.log("[Tabs] Old activeChild:", index);
    children[index].props.isActive = false;
    switch (evt.key) {
      case "ArrowLeft":
        index--;
        index += children.length;
        break;
      case "ArrowRight":
        index++;
        break;
      default:
        break;
    }
    index %= children.length;
    children[index].props.isActive = true;
    findDOMNode(children[index]).scrollIntoView({
      behavior: "auto",
      block: "start",
      inline: "center",
    });
    this.setState({ activeChild: index });
    onChangeIndex && onChangeIndex(index);
  };

  constructor(props) {
    super(props);
    this.state = { activeChild: 0 };
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  render() {
    return <div className={prefixCls}>{this.props.children}</div>;
  }
}

export default Tabs;
