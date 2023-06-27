import { Component } from "inferno";
import "./ImageViewer.css";

interface ImageViewerState {
  zoom: number;
  offsetTop: number;
  offsetLeft: number;
}

interface ImageViewerProps {
  url: string;
  height: number;
  width: number;
}

export default class ImageViewer extends Component<ImageViewerProps, ImageViewerState> {
  public state: ImageViewerState;
  zoomIn = () => {
    this.setState((state: ImageViewerState) => {
      state.zoom *= 1.5;
      return state;
    });
  };

  zoomOut = () => {
    this.setState((state: ImageViewerState) => {
      state.zoom /= 1.5;
      return state;
    });
  };
  
  resetZoom = () => {
    this.setState({ zoom: 1 });
  }

  move = (direction: string) => {
    /*
    const { height, width } = this.props;
    const SCREEN_WIDTH = 240;
    const SCREEN_HEIGHT = 320;
    */
    this.setState((state: ImageViewerState) => {
      switch (direction) {
        case "left":
          state.offsetLeft += Math.floor(state.zoom * 50);
          break;
        case "right":
          state.offsetLeft -= Math.floor(state.zoom * 50);
          break;
        case "up":
          state.offsetTop += Math.floor(state.zoom * 50);
          break;
        case "down":
          state.offsetTop -= Math.floor(state.zoom * 50);
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

  constructor(props: ImageViewerProps) {
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
