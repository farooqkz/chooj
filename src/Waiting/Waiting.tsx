import "./Waiting.css";
import cow from "url:./cowsay-pleasewait.png";

let tips: Array<string> = [
  "Use call key in People tab to quickly call someone",
  "In About tab, you can see credits",
  "Contact developer by pressing Call key in About tab",
  "Press Backspace in Call screen to end the ongoing call",
];

function randomTip() {
  return tips[Math.floor(Math.random() * tips.length)];
}

function Waiting({ noTip }: { noTip?: boolean }) {
  return (
    <>
      <img className="waiting" src={cow} alt="" />
      <p className="waiting" $HasTextChildren>
        {noTip ? "" : randomTip()}
      </p>
    </>
  );
}

export default Waiting;
