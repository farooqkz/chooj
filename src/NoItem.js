export default function NoItem({ text }) {
  return (
    <div style={{ "margin-top": "20vh" }}>
      <p style={{ "text-align": "center" }}>
        <b>{text.toString()}</b>
      </p>
    </div>
  );
}
