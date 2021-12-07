function ScrollIntoView({ children, shouldScroll }) {
  if (children instanceof Array || !children) {
    throw new TypeError("There must be exactly one child. No less, no more!");
  }
  return (
    <div
      ref={shouldScroll ? ((div) => {
        if (div) div.scrollIntoView();
      }) : null}
    >
      {children}
    </div>
  );
}

export default ScrollIntoView;
