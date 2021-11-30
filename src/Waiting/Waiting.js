import "./Waiting.css";
import cow from "./cowsay-pleasewait.png";

let tips = [
  "Use call key in People tab to quickly call someone",
  "In About tab, you can see credits",
  "Contact developer by pressing Call key in About tab",
];

function randomTip() {
  return tips[parseInt(Math.random() * tips.length)];
}

function Waiting(props) {
  return (
    <>
      <img className="waiting" src={cow} alt="" />
      <p className="waiting" $HasTextChildren>
        {randomTip()}
      </p>
    </>
  );
}

export default Waiting;
