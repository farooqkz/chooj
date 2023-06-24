import "./ChatTextInput.css";

interface ChatTextInputProps {
  isFocused: boolean;
  message: string;
  onChangeCb: (message: string) => void;
}

function ChatTextInput({ isFocused, message, onChangeCb }: ChatTextInputProps) {
  const onChange = (evt: Event) => {
    evt.target && onChangeCb(evt.target.value);
  };

  return (
    <div className={"chattextinput" + (isFocused ? "--focused" : "")}>
      <input
        onChange={onChange}
        onPaste={onChange}
        onInput={onChange}
        value={message || ""}
        placeholder="Say Hello!"
        style={`color: ${isFocused ? "var(--text-color)" : ""}`}
        ref={(input) => {
          if (!input) return;
          if (isFocused) input.focus();
          else input.blur();
        }}
      />
    </div>
  );
}

export default ChatTextInput;
