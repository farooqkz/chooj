import { Component } from "inferno";
import classnames from "classnames";
import "KaiUI/src/components/TextInput/TextInput.scss";
import morecolor from "./morecolor.scss";

const prefixCls = "kai-text-input";
const labelCls = `${prefixCls}-label p-thi`;
const inputCls = `${prefixCls}-label p-pri`;

class TextInput extends Component {
  constructor(props) {
    const { defaultValue } = props;
    super(props);
    this.onChange = (evt) => {
      this.setState({ value: evt.target.value });
      if (this.props.onChange) this.props.onChange(evt.target.value);
    };

    this.state = {
      value: defaultValue || "",
    };
  }

  componentDidUpdate() {
    if (this.props.isFocused) this.textInput.focus();
  }

  render() {
    const itemCls = classnames([
      prefixCls,
      this.props.isFocused && `${prefixCls}--focused ${this.focusClass || ""}`,
    ]);

    return (
      <div
        id={this.props.id}
        tabIndex={0}
        className={itemCls}
        style={`background-color: ${
          this.props.isFocused ? morecolor.item_bg_focus_color : ""
        }`}
      >
        <label className={labelCls} $HasTextChildren>
          {this.props.label}
        </label>
        <input
          onKeyDown={this.onChange}
          onChange={this.onChange}
          onPaste={this.onChange}
          onKeyUp={this.onChange}
          onKeyPress={this.onChange}
          onInput={this.onChange}
          type={this.props.fieldType}
          className={inputCls}
          defaultValue={this.state.value || ""}
          placeholder={this.props.placeholder || ""}
          style={`color: ${this.props.isFocused ? "var(--text-color)" : ""}`}
          ref={(input) => {
            this.textInput = input;
          }}
        />
      </div>
    );
  }
}

export default TextInput;
