var _ = require("lodash");
var Q = require("q");
var fs = require("./fs");
var spawn = require("spawn-cmd").spawn;

// Convert a svg file
var convertSVG = function(source, dest, options) {
    if (!fs.existsSync(source)) return Q.reject(new Error("File doesn't exist: "+source));
    var d = Q.defer();

    options = _.defaults(options || {}, {

    });

    //var command = shellescape(["svgexport", source, dest]);
    var child = spawn("svgexport", [source, dest]);

    child.on("error", function(error) {
        if (error.code == "ENOENT") error = new Error("Need to install \"svgexport\" using \"npm install svgexport -g\"");
        return d.reject(error);
    });

    child.on("close", function(code) {
        if (code === 0 && fs.existsSync(dest)) {
            d.resolve();
        } else {
            d.reject(new Error("Error converting "+source+" into "+dest));
        }
    });

    return d.promise;
};

module.exports = {
    convertSVG: convertSVG,
    INVALID: [".svg"]
};
