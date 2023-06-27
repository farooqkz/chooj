import { render } from "inferno";
import "core-js";
import "abortcontroller-polyfill/dist/polyfill-patch-fetch";
import "./index.css";
import App from "./App";

render(<App />, document.getElementById("root"));
