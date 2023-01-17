import "KaiUI/src/theme/colors.scss";
import "KaiUI/src/components/Tab/Tab.scss";

const prefixCls = "kai-tab";

function Tab({ focusColor, isActive, onTabChange, label }) {
  const actPrefixCls = `${prefixCls}${isActive ? "-active" : "-inactive"}`;
  return (
    <div
      onClick={() => {
        onTabChange && onTabChange(this.index);
      }}
      className={actPrefixCls}
      style={{
        "--tab-underline-color": focusColor || "var(--color-purple)",
      }}
    >
      <div className={`${actPrefixCls}-label`} $HasTextChildren>
        {label}
      </div>
    </div>
  );
}

export default Tab;
