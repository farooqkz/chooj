import { Component } from "inferno";
import "./ChatTextInput.css";

class ChatTextInput extends Component {
  constructor(props) {
    super(props);
    this.onChange = (event_) => {
      if (event_.key === "ArrowUp" || event_.key === "ArrowDown")
        this.props.unFocusIt();
      this.setState({ value: event_.target.value });
      this.props.onChangeCb && this.props.onChangeCb(event_.target.value);
    };
    this.state = {
      value: props.message || "",
    };
  }

  componentDidUpdate(lastProps) {
    if (!this.textInput) return;
    console.log("HELLO", this.props.isFocused);
    if (this.props.isFocused) {
      this.textInput.focus();
    } else {
      this.textInput.blur();
    }
  }

  render() {
    return (
      <div
        className={"chattextinput" + (this.props.isFocused ? "--focused" : "")}
      >
        <input
          onKeyDown={this.onChange}
          onChange={this.onChange}
          onPaste={this.onChange}
          onKeyUp={this.onChange}
          onKeyPress={this.onChange}
          onInput={this.onChange}
          defaultValue={this.state.value || ""}
          placeholder="Say Salam!"
          style={`color: ${this.props.isFocused ? "var(--text-color)" : ""}`}
          ref={(input) => {
            this.textInput = input;
          }}
        />
      </div>
    );
  }
}

export default ChatTextInput;
