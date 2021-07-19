import { Component } from "inferno";
import "./waiting.css";
import cow from "./cowsay-pleasewait.png";

class Waiting extends Component {
  render() {
    return (
      <>
        <img src={cow} alt="" />
      </>
    );
  }
}

export default Waiting;
