import "./NoItem";

interface NoItemProps {
  text: string;
}

export default function NoItem({ text }: NoItemProps) {
  return (
    <div className="noitem">
      <h1 $HasTextChildren>{text}</h1>
    </div>
  );
}
