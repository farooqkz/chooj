import "core-js";
import { render } from "inferno";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

window.isFullScreen = false;
window.stateStores = new Map();
// ^ This is used to save state of components on unmount
// and later retrieve it when the component is constructed

render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
