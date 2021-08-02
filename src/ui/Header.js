import "KaiUI/src/components/Header/Header.scss";
import colors from "KaiUI/src/theme/colors.scss";
import { createTextVNode } from "inferno";

function Header(props) {
  return (
    <header
      className="kai-header"
      style={{ background: props.backgroundColor || colors.headerBlue }}
    >
      <h1 className="h1" $HasVNodeChildren>
        {createTextVNode(props.text)}
      </h1>
    </header>
  );
}

export default Header;
