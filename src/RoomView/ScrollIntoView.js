function ScrollIntoView({ children }) {
  if (children instanceof Array || !children) {
    throw new TypeError("There must be exactly one child. No less, no more!");
  }
  children.props.isFocused = true;
  return (
    <div
      ref={(div) => {
        if (div) div.scrollIntoView();
      }}
    >
      {children}
    </div>
  );
}

export default ScrollIntoView;
