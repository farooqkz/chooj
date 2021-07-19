import { Component } from "inferno";
import { findDOMNode } from "inferno-extras";
import "KaiUI/src/components/Tabs/Tabs.scss";

const prefixCls = "kai-tabs";

class Tabs extends Component {
  handleKeyDown = (evt) => {
    if (!["ArrowLeft", "ArrowRight"].includes(evt.key)) return;
    let index = this.state.activeChild;
    console.log("[Tabs] Old activeChild:", index);
    this.children[index].props.isActive = false;
    switch (evt.key) {
      case "ArrowLeft":
        index--;
        index += this.children.length;
        break;
      case "ArrowRight":
        index++;
        break;
      default:
        break;
    }
    index %= this.children.length;
    this.children[index].props.isActive = true;
    findDOMNode(this.children[index]).scrollIntoView({
      behavior: "auto",
      block: "start",
      inline: "center",
    });
    this.setState({ activeChild: index });
    this.onChangeIndex && this.onChangeIndex(index);
  };

  constructor(props) {
    const { onChangeIndex, children } = props;
    super(props);
    this.children = children;
    this.onChangeIndex = onChangeIndex;
    this.state = { activeChild: 0 };
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  render() {
    return <div className={prefixCls}>{this.children}</div>;
  }
}

export default Tabs;
