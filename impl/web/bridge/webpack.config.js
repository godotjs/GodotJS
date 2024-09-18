const path = require("path");

module.exports = {
    mode: "development",
    entry: __dirname + "/../bridge/out/api.js",
    output: {
        filename: "jsb_web.api.js",
        path: path.join(__dirname, "temp/"),
        // path: path.join(__dirname, "../../../../../bin/"),
    },
}
