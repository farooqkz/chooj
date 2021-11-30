import "KaiUI/src/components/Header/Header.scss";
import colors from "KaiUI/src/theme/colors.scss";

function Header(props) {
  return (
    <header
      className="kai-header"
      style={{ background: props.backgroundColor || colors.headerBlue }}
      $HasTextChildren
    >
      <h1 className="h1" $HasVNodeChildren>
        {props.text}
      </h1>
    </header>
  );
}

export default Header;
