import { render } from "inferno";
import "core-js";
import "abortcontroller-polyfill/dist/polyfill-patch-fetch";
import "./index.css";
import App from "./App";

window.isFullScreen = false;
// This is used to track the fullscreen state of the App
// false means the app is not fullscreen
window.stateStores = new Map();
// ^ This is used to save state of components on unmount
// and later retrieve it when the component is constructed

Object.defineProperty(XMLHttpRequest.prototype, "mozSystem", { value: true });
render(<App />, document.getElementById("root"));
