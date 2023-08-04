import "./NoItem.css";

interface NoItemProps {
  text: string;
}

export default function NoItem({ text }: NoItemProps) {
  return (
    <div className="noitem">
      <h3 $HasTextChildren>{text}</h3>
    </div>
  );
}
