import { Component, createTextVNode } from "inferno";
import colors from "KaiUI/src/theme/colors.scss";
import "KaiUI/src/components/Tab/Tab.scss";

const prefixCls = "kai-tab";

class Tab extends Component {
  constructor(props) {
    const { focusColor } = props;
    super(props);
    this.style = {
      "--tab-underline-color": focusColor || colors.defaultFocusColor,
    };
  }

  render() {
    const actPrefixCls = `${prefixCls}${
      this.props.isActive ? "-active" : "-inactive"
    }`;
    return (
      <div
        onClick={() => {
          this.props.onTabChange && this.props.onTabChange(this.index);
        }}
        className={actPrefixCls}
        style={this.style}
        key={this.props.isActive}
      >
        <div className={`${actPrefixCls}-label`} $HasVNodeChildren>
          {createTextVNode(this.props.label)}
        </div>
      </div>
    );
  }
}

export default Tab;
