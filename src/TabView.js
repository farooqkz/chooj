import { Component } from "inferno";
import Tabs from "./ui/Tabs";
import Tab from "./ui/Tab";
import colors from "KaiUI/src/theme/colors.scss";
import "KaiUI/src/views/TabView/TabView.scss";

const prefixCls = "kai-tab-view";
const tabViewTabs = `${prefixCls}-tabs`;
const tabViewContent = `${prefixCls}-content`;

class TabView extends Component {
  handleChangeIndex = (tabIndex) => {
    this.setState({ activeTab: tabIndex });
    if (this.props.onChangeIndex) this.props.onChangeIndex(tabIndex);
  };

  constructor(props) {
    super(props);
    const { focusColor } = props;
    this.focusColor = focusColor || colors.defaultFocusColor;
    this.tabs = this.props.tabLabels.map((label) => (
      <Tab label={label} focusColor={this.props.focusColor} />
    ));
    this.tabs[0].props.isActive = true;
    this.state = { activeTab: 0 };
  }

  render() {
    return (
      <div className={prefixCls}>
        <div className={tabViewTabs}>
          <Tabs onChangeIndex={this.handleChangeIndex} $HasNonKeyedChildren>
            {this.tabs}
          </Tabs>
        </div>
        <div className={tabViewContent}>
          {this.props.children.map(
            (content, index) =>
              index === this.state.activeTab ? content : null,
            this
          )}
        </div>
      </div>
    ); // XXX maybe use filter()?
  }
}

export default TabView;
