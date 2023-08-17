const fs = require("node:fs");
const { Parser } = require("htmlparser2");
const { DomHandler, Element } = require("domhandler");
const render = require("dom-serializer").default;


var sdkPath;
let collect = false;
for (let arg of process.argv) {
  if (collect) {
    sdkPath = arg;
    break;
  }
  if (arg === "--path") {
    collect = true;
  }
}

let html = fs.readFileSync("build/index.html", { encoding: "utf-8" });
const handler = new DomHandler((error, dom) => {
  if (error) {
    console.error("Cannot parse index.html into DOM");
    process.exit(1);
  }
  let head = dom[1].children.filter((child) => child.name === "head")[0];
  if (!head) {
    console.error("No <head> found...");
    process.exit(1);
  }
  head.children.push(new Element("script", { src: "/kaiads.js", defer: true }));
  fs.writeFileSync("./build/index.html", render(dom));
  console.log("Successfully added the <script> tag");
});
const parser = new Parser(handler);
parser.write(html);
parser.end();
fs.copyFile(sdkPath, "./build/kaiads.js");
