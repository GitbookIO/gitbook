var _ = require("lodash");
var Q = require("q");
var fs = require("./fs");
var exec = require('child_process').exec;

var links = require("./links");

// Convert a svg file
var convertSVG = function(source, dest, options) {
	if (!fs.existsSync(source)) return Q.reject(new Error("File doesn't exist: "+source));

	var d = Q.defer();

	options = _.defaults(options || {}, {

	});

	var command = "svgexport "+source+" "+dest;

    var child = exec(command, function (error, stdout, stderr) {
        if (error) {
        	if (error.code == 127) error = new Error("Need to install 'svgexport' using 'npm install svgexport -g'");
        	return d.reject(error);
        }
        d.resolve();
    });

	return d.promise;
};

module.exports = {
	convertSVG: convertSVG,
	INVALID: [".svg"]
};
