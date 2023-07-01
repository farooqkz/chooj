import { Component } from "inferno";
import { SoftKey } from "KaiUI";
import StepZero from "./StepZero";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import StepThree from "./StepThree";
import StepFour from "./StepFour";
import StepFive from "./StepFive";
import StepFinal from "./StepFinal";
import "./Step.css";


const NUMBER_OF_STEPS = 6;

interface GuideState {
  step: number;
}

interface GuideProps {
  endCb: () => void;
}

class Guide extends Component<GuideProps, GuideState> { 
  public state: GuideState;
  
  centerText = () => {
    if (this.state.step >= NUMBER_OF_STEPS) {
      return "Finish";
    } else {
      return "Next";
    }
  };

  centerCb = () => {
    switch (this.centerText()) {
      case "Finish":
        this.props.endCb();
        break;
      case "Next":
        this.setState((state: GuideState) => {
          state.step += 1;
          return state;
        });
        break;
      default:
        break;
    }
  };

  rightText = () => {
    if (this.state.step <= 0) {
      return "";
    } else {
      return "Prev.";
    }
  };
  
  rightCb = () => {
    if (this.rightText() === "") {
      return;
    }
    if (this.rightText() === "Prev.") {
      this.setState((state: GuideState) => {
        state.step -= 1;
        return state;
      });
    }
  }

  constructor(props: any) {
    super(props);
    this.state = {
      step: 0
    };
  }

  render() {
    let Step: any;
    switch (this.state.step) {
      case 0:
        Step = StepZero;
        break;
      case 1:
        Step = StepOne;
        break;
      case 2:
        Step = StepTwo;
        break;
      case 3:
        Step = StepThree;
        break;
      case 4:
        Step = StepFour;
        break;
      case 5:
        Step = StepFive;
        break;
      default:
        Step = StepFinal;
        break;
    }
    return (
      <>
        <Step />
        <SoftKey
          centerCb={this.centerCb}
          centerText={this.centerText()}
          leftCb={this.props.endCb}
          leftText="Skip"
          rightCb={this.rightCb}
          rightText={this.rightText()}
        />
      </>
    );
  }
}

export default Guide;
