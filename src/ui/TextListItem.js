import "KaiUI/src/components/TextListItem/TextListItem.scss";
import * as morecolor from "./morecolor.scss";
import { Component, createRef } from "inferno";
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
    const { isFocused, primary, secondary, tertiary } = this.props;
    const focusedCls = isFocused
      ? `${prefixCls}-focused ${this.props.focusClass || "defaultFocusCls"}`
      : "";
    return (
      <div
        tabIndex={0}
        className={classNames(itemCls, this.className, focusedCls)}
        ref={this.divRef}
        style={`background-color: ${
          isFocused ? morecolor.item_bg_focus_color : ""
        }`}
      >
        <span
          className={classNames(primaryCls, this.className)}
          $HasTextChildren
        >
          {primary}
        </span>
        <label className={this.secondaryCls} $HasTextChildren>
          {secondary}
        </label>
        <label className={this.tertiaryCls} $HasTextChildren>
          {tertiary}
        </label>
      </div>
    );
  }
}

export default TextListItem;
