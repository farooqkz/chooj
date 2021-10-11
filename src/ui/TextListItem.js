import "KaiUI/src/components/TextListItem/TextListItem.scss";
import morecolor from "./morecolor.scss";
import { Component, createRef, createTextVNode } from "inferno";
import classNames from "classnames";

const prefixCls = "kai-tl";
const itemCls = prefixCls;
const primaryCls = `${prefixCls}-primary`;

class TextListItem extends Component {
  constructor(props) {
    const { tertiary, secondary, className } = props;
    super(props);
    this.secondaryCls = `${prefixCls}-secondary ${secondary ? "" : "hidden"}`;
    this.tertiaryCls = `${prefixCls}-tertiary ${tertiary ? "" : "hidden"}`;
    this.className = className || "";
    this.divRef = createRef();
  }

  componentDidUpdate(lastProps) {
    if (this.props.isFocused && this.divRef.current)
      this.divRef.current.focus();
  }

  render() {
    const focusedCls = this.props.isFocused
      ? `${prefixCls}-focused ${this.props.focusClass || "defaultFocusCls"}`
      : "";
    return (
      <div
        tabIndex={0}
        className={classNames(itemCls, this.className, focusedCls)}
        key={this.props.isFocused}
        ref={this.divRef}
        style={`background-color: ${
          this.props.isFocused ? morecolor.item_bg_focus_color : ""
        }`}
        $HasNonKeyedChildren
      >
        <span
          className={classNames(primaryCls, this.className)}
          $HasVNodeChildren
        >
          {createTextVNode(this.props.primary)}
        </span>
        <label className={this.secondaryCls} $HasVNodeChildren>
          {createTextVNode(this.props.secondary)}
        </label>
        <label className={this.tertiaryCls} $HasVNodeChildren>
          {createTextVNode(this.props.tertiary)}
        </label>
      </div>
    );
  }
}

export default TextListItem;
