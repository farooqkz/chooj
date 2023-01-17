import "KaiUI/src/components/Header/Header.scss";
import * as colors from "KaiUI/src/theme/colors.scss";

function Header({ backgroundColor, text }) {
  console.log(colors);
  return (
    <header
      className="kai-header"
      style={{ background: backgroundColor || colors.headerBlue }}
    >
      <h1 className="h1" $HasTextChildren>
        {text}
      </h1>
    </header>
  );
}

export default Header;
