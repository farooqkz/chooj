import "KaiUI/src/components/TextListItem/TextListItem.scss";
import morecolor from "./morecolor.scss";
import { Component, createRef, createTextVNode } from "inferno";
import classNames from "classnames";

const prefixCls = "kai-tl";
const itemCls = prefixCls;
const primaryCls = `${prefixCls}-primary`;

class TextListItem extends Component {
  constructor(props) {
    const { primary, secondary, tertiary, focusClass, className } = props;
    super(props);
    this.secondaryCls = `${prefixCls}-secondary ${secondary ? "" : "hidden"}`;
    this.tertiaryCls = `${prefixCls}-tertiary ${tertiary ? "" : "hidden"}`;
    this.primary = primary;
    this.secondary = secondary;
    this.tertiary = tertiary;
    this.focusClass = focusClass;
    this.className = className || "";
    this.divRef = createRef();
  }

  componentDidUpdate(lastProps) {
    if (this.props.isFocused && this.divRef.current);
     // this.divRef.current.focus();
  }

  render() {
    const focusedCls = this.props.isFocused
      ? `${prefixCls}-focused ${this.focusClass || "defaultFocusCls"}`
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
        <span className={classNames(primaryCls, this.className)} $HasVNodeChildren>
          {createTextVNode(this.primary)}
        </span>
        <label className={this.secondaryCls} $HasVNodeChildren>
          {createTextVNode(this.secondary)}
        </label>
        <label className={this.tertiaryCls} $HasVNodeChildren>
          {createTextVNode(this.tertiary)}
        </label>
      </div>
    );
  }
}

export default TextListItem;
