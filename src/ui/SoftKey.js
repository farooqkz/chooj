import { Component } from "inferno";
import "KaiUI/src/components/SoftKey/SoftKey.scss";

const prefixCls = "kai-softkey";

class Button extends Component {
  render() {
    let renderedIcon;
    const icon = this.props.icon;
    if (icon && icon.toString.indexOf("kai-") === -1) {
      renderedIcon = <img src={icon} width={20} height={20} alt="" />;
    } else {
      renderedIcon = <span className={icon} />;
    }
    return (
      <button
        id={this.props.id}
        className={`${prefixCls}-btn`}
        onClick={this.props.handleClick}
        data-icon={renderedIcon ? "true" : undefined}
      >
        {renderedIcon} {this.props.text}
      </button>
    );
  }
}

class SoftKey extends Component {
  handleKeyDown = (evt) => {
    switch (evt.key) {
      case "Enter":
        if (this.props.centerCb) this.props.centerCb();
        break;
      case "SoftLeft":
        if (this.props.leftCb) this.props.leftCb();
        break;
      case "SoftRight":
        if (this.props.rightCb) this.props.rightCb();
        break;
      default:
        break;
    }
  };

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  render() {
    let softKeyAttrs = [
      {
        id: "leftSoftKey",
        text: this.props.leftText,
        icon: this.props.leftIcon,
        handleClick: () => this.handleKeyDown({ key: "SoftLeft" }),
      },
      {
        id: "centerSoftKey",
        text: this.props.centerText,
        icon: this.props.centerIcon,
        handleClick: () => this.handleKeyDown({ key: "Enter" }),
      },
      {
        id: "rightSoftKey",
        text: this.props.rightText,
        icon: this.props.rightIcon,
        handleClick: () => this.handleKeyDown({ key: "SoftRight" }),
      },
    ];

    return (
      <div className={`${prefixCls} visible`}>
        {softKeyAttrs.map((attrs) => (
          <Button {...attrs} />
        ))}
      </div>
    );
  }
}

export default SoftKey;
