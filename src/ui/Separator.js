import { Component } from "inferno";
import "KaiUI/src/components/Separator/Separator.scss";

const prefixCls = "kai-separator";
const textCls = `${prefixCls}-text`;

class Separator extends Component {
  constructor(props) {
    props.unFocusable = true;
    super(props);
  }

  render() {
    return (
      <div className={prefixCls}>
        <span className={textCls} $HasTextChildren>
          {this.props.text}
        </span>
      </div>
    );
  }
}

export default Separator;
