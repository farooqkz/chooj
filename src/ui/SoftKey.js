import { Component, createTextVNode } from "inferno";
import "KaiUI/src/components/SoftKey/SoftKey.scss";

const prefixCls = "kai-softkey";
function Button({ id, handleClick, icon, text }) {
  let renderedIcon;
  if (icon && icon.toString.indexOf("kai-") === -1) {
    renderedIcon = <img src={icon} width={20} height={20} alt="" />;
  } else {
    renderedIcon = <span className={icon} />;
  }
  return (
    <button
      id={id}
      className={`${prefixCls}-btn`}
      onClick={handleClick}
      data-icon={renderedIcon ? "true" : undefined}
      $HasNonKeyedChildren
    >
      {renderedIcon} {createTextVNode(text)}
    </button>
  );
}

class SoftKey extends Component {
  handleKeyDown = (evt) => {
    const { centerCb, rightCb, leftCb } = this.props;
    switch (evt.key) {
      case "Enter":
        if (centerCb) centerCb();
        break;
      case "SoftLeft":
        if (leftCb) leftCb();
        break;
      case "SoftRight":
        if (rightCb) rightCb();
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
    const { leftText, leftIcon, rightText, rightIcon, centerText, centerIcon } =
      this.props;
    let softKeyAttrs = [
      {
        id: "leftSoftKey",
        text: leftText,
        icon: leftIcon,
        handleClick: () => this.handleKeyDown({ key: "SoftLeft" }),
      },
      {
        id: "centerSoftKey",
        text: centerText,
        icon: centerIcon,
        handleClick: () => this.handleKeyDown({ key: "Enter" }),
      },
      {
        id: "rightSoftKey",
        text: rightText,
        icon: rightIcon,
        handleClick: () => this.handleKeyDown({ key: "SoftRight" }),
      },
    ];

    return (
      <div className={`${prefixCls} visible`} $HasNonKeyedChildren>
        {softKeyAttrs.map((attrs) => (
          <Button {...attrs} />
        ))}
      </div>
    );
  }
}

export default SoftKey;
