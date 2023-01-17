import { Component } from "inferno";
import Tabs from "./ui/Tabs";
import Tab from "./ui/Tab";
import "KaiUI/src/views/TabView/TabView.scss";
import morecolor from "./ui/morecolor";

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
    const { defaultActiveTab, focusColor } = props;
    this.focusColor = focusColor || morecolors.defaultFocusColor;
    this.tabs = this.props.tabLabels.map((label) => (
      <Tab label={label} focusColor={this.props.focusColor} />
    ));
    //this.state = window.stateStores.get("TabView") || { activeTab: 0 };
    this.state = {
      activeTab: defaultActiveTab || 0,
    };
    this.tabs[this.state.activeTab].props.isActive = true;
  }

  componentWillUnmount() {
    //window.stateStores.set("TabView", this.state);
  }

  render() {
    return (
      <div className={prefixCls}>
        <div className={tabViewTabs}>
          <Tabs
            defaultActiveChild={this.state.activeTab}
            onChangeIndex={this.handleChangeIndex}
            $HasNonKeyedChildren
          >
            {this.tabs}
          </Tabs>
        </div>
        <div className={tabViewContent} $HasVNodeChildren>
          {
            this.props.children
              .map(
                (content, index) =>
                  index === this.state.activeTab ? content : null,
                this
              )
              .filter((content) => Boolean(content))[0]
          }
        </div>
      </div>
    );
  }
}

export default TabView;
