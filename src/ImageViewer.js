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

  move = (direction) => {
    this.setState((state) => {
      switch (direction) {
        case "left":
          state.offsetLeft -= state.zoom * 50;
          break;
        case "right":
          state.offsetLeft += state.zoom * 50;
          break;
        case "up":
          state.offSetTop -= state.zoom * 50;
          break;
        case "down":
          state.offSetTop += state.zoom * 50;
          break;
      }
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
      <div className="imageviewer" style={{ "margin-top": offsetTop, "margin-left": offsetLeft }}>
        <img height={height * zoom} width={width * zoom}  src={url} />
      </div>
    );
  }
}
