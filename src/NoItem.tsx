interface NoItemProps {
  text: string;
}

export default function NoItem({ text }: NoItemProps) {
  return (
    <div style={{ "margin-top": "20vh" }}>
      <p style={{ "text-align": "center" }}>
        <b>{text}</b>
      </p>
    </div>
  );
}
