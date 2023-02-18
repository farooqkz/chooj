import { Component } from "inferno";
import "./ImageViewer.css";

export default class ImageViewer extends Component {
  zoomIn = () => {
    this.setState((state) => {
      state.zoom *= 1.5;
      return state;
    });
  };

  zoomOut = () => {
    this.setState((state) => {
      state.zoom /= 1.5;
      return state;
    });
  };
  
  resetZoom = () => {
    this.setState({ zoom: 1 });
  }

  move = (direction) => {
    const { height, width } = this.props;
    const SCREEN_WIDTH = 240;
    const SCREEN_HEIGHT = 320;
    this.setState((state) => {
      switch (direction) {
        case "left":
          state.offsetLeft += parseInt(state.zoom * 50);
          break;
        case "right":
          state.offsetLeft -= parseInt(state.zoom * 50);
          break;
        case "up":
          state.offsetTop += parseInt(state.zoom * 50);
          break;
        case "down":
          state.offsetTop -= parseInt(state.zoom * 50);
          break;
        default:
          console.log("[ImageViewer] Invalid direction for move:", direction);
      }
      /*
      state.offsetTop = Math.min(0, state.offsetTop);
      state.offsetTop = Math.max(SCREEN_HEIGHT, state.offsetTop);
      state.offsetLeft = Math.min(0, state.offsetLeft);
      state.offsetLeft = Math.max(SCREEN_WIDTH, state.offsetLeft);
      */
      return state;
    });
  };

  constructor(props) {
    super(props);
    this.state = {
      zoom: 1,
      offsetTop: 0,
      offsetLeft: 0,
    };
  }

  render() {
    const { zoom, offsetTop, offsetLeft } = this.state;
    const { url, height, width } = this.props;
    return (
      <div className="imageviewer" style={{ "margin-top": `${offsetTop}px`, "margin-left": `${offsetLeft}px` }}>
        <img height={height * zoom} width={width * zoom}  src={url} alt="" />
      </div>
    );
  }
}
