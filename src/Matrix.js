import { Component } from "inferno";
import * as localforage from "localforage";

class Matrix extends Component {
  constructor(props) {
    super(props);
    this.state = {
      state: null,
    };
  }

  render() {
    console.log(this.props.data);
    return <>Hi!</>;
  }
}

export default Matrix;
