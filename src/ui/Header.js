import "KaiUI/src/components/Header/Header.scss";
import colors from "KaiUI/src/theme/colors.scss";
import { createTextVNode, Component } from "inferno";

class Header extends Component {
  constructor(props) {
    super(props);
    console.log(`[ui/Header] text: ${props.text}`);
  }

  render() {
    return (
      <header
        className="kai-header"
        style={{ background: this.props.backgroundColor || colors.headerBlue }}
      >
        <h1 className={"h1"} $HasVNodeChildren>
          {createTextVNode(this.props.text)}
        </h1>
      </header>
    );
  }
}

export default Header;
