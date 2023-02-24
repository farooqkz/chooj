const htmlparser2 = require("htmlparser2");

const fs = require("node:fs");

const query = new htmlparser2.Parser({
  onopentag(name, attributes) {
    if (name === "script") {
      if (attributes.type === "module") {
        console.log("Removing", attributes.src);
        fs.unlinkSync("build/" + attributes.src);
      } else {
        let dir = fs.opendirSync("build/");
        let script = fs.readFileSync("build/" + attributes.src, { encoding: "utf-8" });
        while (true) {
          let dirent = dir.readSync();
          if (!dirent) {
            break;
          }
          if (dirent.name.startsWith("rust-crypto")) {
            if (script.indexOf(dirent.name) === -1) {
              console.log("Removing", dirent.name);
              fs.unlinkSync("build/" + dirent.name);
            }
          }
        }
      }
    }
  }
});


query.write(fs.readFileSync("build/index.html", { encoding: "utf-8"}));
