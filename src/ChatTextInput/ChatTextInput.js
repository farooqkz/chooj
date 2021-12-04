import "./ChatTextInput.css";

function ChatTextInput({ isFocused, message, onChangeCb }) {
  const onChange = (evt) => {
    onChangeCb && onChangeCb(evt.target.value);
  };

  return (
    <div className={"chattextinput" + (isFocused ? "--focused" : "")}>
      <input
        onChange={onChange}
        onPaste={onChange}
        onInput={onChange}
        value={message || ""}
        placeholder="Say Salam!"
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
