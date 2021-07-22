import { createTextVNode, Component } from "inferno";
import "./waiting.css";
import cow from "./cowsay-pleasewait.png";

let tips = [
  "Use call key in People tab to quickly call someone",
  "In About tab, you can see credits",
  "Contact developer by pressing Call key in About tab",
];

function randomTip() {
  return tips[parseInt(Math.random() * tips.length)];
}

class Waiting extends Component {
  render() {
    return (
      <>
        <img src={cow} alt="" />
        <p $HasVNodeChildren>{createTextVNode(randomTip())}</p>
      </>
    );
  }
}

export default Waiting;
