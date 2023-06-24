
interface ScrollIntoViewProps {
  children: any;
  shouldScroll: boolean;
}

function ScrollIntoView({ children, shouldScroll }: ScrollIntoViewProps) {
  if (children instanceof Array || !children) {
    throw new TypeError("There must be exactly one child. No less, no more!");
  }
  return (
    <div
      ref={
        shouldScroll
          ? (div) => {
              if (div) div.scrollIntoView();
            }
          : null
      }
      $HasVNodeChildren
    >
      {children}
    </div>
  );
}

export default ScrollIntoView;
