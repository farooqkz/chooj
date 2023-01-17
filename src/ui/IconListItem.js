import classNames from "classnames";
import "KaiUI/src/components/IconListItem/IconListItem.scss";
import * as morecolor from "./morecolor.scss";

const prefixCls = "kai-il";
const lineCls = `${prefixCls}-line`;
const itemCls = prefixCls;
const primaryCls = `${prefixCls}-line`;

function IconListItem({
  isFocused,
  disabled,
  primary,
  secondary,
  iconSrc,
  iconWidth,
  onClick,
  icon,
  className,
}) {
  const focusedCls = isFocused
    ? `${prefixCls}-focused ${this.focusClass || ""}`
    : "";
  const iconCls = `${prefixCls}-icon-${isFocused ? "focused" : "unfocused"}`;
  const secondaryCls = `${prefixCls}-secondary ${secondary ? "" : "hidden"}`;
  const disabledCls = disabled ? `${prefixCls}-disabled` : "";
  let renderedIcon;
  if (iconSrc)
    renderedIcon = <img src={iconSrc} alt="" width={iconWidth || 50} />;
  else if (icon instanceof String && icon.startsWith("kai"))
    renderedIcon = <span className={icon} style={{ width: iconWidth }} />;
  // Then we assume it is a valid element TODO: check for this
  else renderedIcon = <span>{icon}</span>;

  return (
    <div
      tabIndex={disabled ? undefined : 1}
      className={classNames(itemCls, disabledCls, className, focusedCls)}
      onClick={onClick}
      ref={(div) => {
        if (div) {
          if (isFocused) div.focus();
          else div.blur();
        }
      }}
      style={{
        "background-color": isFocused ? morecolor.item_bg_focus_color : "",
      }}
    >
      <div className={iconCls} $HasVNodeChildren>
        {renderedIcon}
      </div>
      <div className={lineCls}>
        <label className={secondaryCls} $HasTextChildren>
          {secondary}
        </label>
        <span className={primaryCls} $HasTextChildren>
          {primary}
        </span>
      </div>
    </div>
  );
}

export default IconListItem;
