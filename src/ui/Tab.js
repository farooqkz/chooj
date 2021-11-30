import colors from "KaiUI/src/theme/colors.scss";
import "KaiUI/src/components/Tab/Tab.scss";

const prefixCls = "kai-tab";

function Tab(props) {
  const { focusColor, isActive, onTabChange, label } = props;
  const actPrefixCls = `${prefixCls}${isActive ? "-active" : "-inactive"}`;
  return (
    <div
      onClick={() => {
        onTabChange && onTabChange(this.index);
      }}
      className={actPrefixCls}
      style={{
        "--tab-underline-color": focusColor || colors.defaultFocusColor,
      }}
      key={isActive}
    >
      <div className={`${actPrefixCls}-label`} $HasTextChildren>
        {label}
      </div>
    </div>
  );
}

export default Tab;
