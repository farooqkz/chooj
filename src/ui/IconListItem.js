import { Component, createTextVNode, createRef } from "inferno";
import classNames from "classnames";
import "KaiUI/src/components/IconListItem/IconListItem.scss";
import morecolor from "../morecolor.scss";

const prefixCls = "kai-il";

class IconListItem extends Component {
  constructor(props) {
    super(props);
    const {
      primary,
      secondary,
      icon,
      iconSrc,
      focusClass,
      iconWidth,
      disabled,
      className,
      onClick,
    } = props;
    this.primary = primary;
    this.secondary = secondary;
    this.itemCls = prefixCls;
    this.lineCls = `${prefixCls}-line`;
    this.primaryCls = `${this.primaryCls}-primary`;
    this.secondaryCls = `${prefixCls}-secondary ${secondary ? "" : "hidden"}`;
    this.disabledCls = disabled ? `${prefixCls}-disabled` : "";
    this.disabled = disabled;
    this.className = className;
    this.focusClass = focusClass;
    this.handleClick = onClick;
    if (iconSrc)
      this.renderedIcon = <img src={iconSrc} alt="" width={iconWidth || 50} />;
    else if (icon instanceof String && icon.startsWith("kai"))
      this.renderedIcon = (
        <span className={icon} style={{ width: iconWidth }} />
      );
    // Then we assume it is a valid element TODO: check for this
    else this.renderedIcon = <span>{icon}</span>;
    this.divRef = createRef();
  }

  componentDidUpdate(lastProps, lastState) {
    if (this.props.isFocused) {
      this.divRef.current.focus();
    }
  }
  render() {
    const focusedCls = this.props.isFocused
      ? `${prefixCls}-focused ${this.focusClass || ""}`
      : "";
    const iconCls = `${prefixCls}-icon-${
      this.props.isFocused ? "focused" : "unfocused"
    }`;

    return (
      <div
        tabIndex={this.disabled ? undefined : 1}
        className={classNames(
          this.itemCls,
          this.disabledCls,
          this.className,
          focusedCls
        )}
        onClick={this.handleClick}
        key={this.props.isFocused}
        ref={this.divRef}
        style={{
          "background-color": this.props.isFocused
            ? morecolor.item_bg_focus_color
            : "",
        }}
      >
        <div className={iconCls}>{this.renderedIcon}</div>
        <div className={this.lineCls}>
          <span className={this.primaryCls} $HasVNodeChildren>
            {createTextVNode(this.primary)}
          </span>
          <label className={this.secondaryCls} $HasVNodeChildren>
            {createTextVNode(this.secondary)}
          </label>
        </div>
      </div>
    );
  }
}

export default IconListItem;
