var _ = require("lodash");
var Q = require("q");
var fs = require("./fs");
var exec = require('child_process').exec;
var request = require("request");

var links = require("./links");

// Convert a svg file
var convertSVGFile = function(source, dest, options) {
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

// Convert a svg file or url
var convertSVG = function(source, dest, options) {
	if (!links.isExternal(source)) return convertSVGFile(source, dest, options);

	return fs.tmp.file({ postfix: '.svg' })

	// Download file
	.then(function(tmpfile) {
		return fs.writeStream(tmpfile, request(source))
		.thenResolve(tmpfile);
	})
	.then(function(tmpfile) {
		return convertSVGFile(tmpfile, dest, options);
	});
};

module.exports = {
	convertSVG: convertSVG,
	INVALID: [".svg"]
};
