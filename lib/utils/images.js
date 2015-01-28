var _ = require("lodash");
var Q = require("q");
var fs = require("fs");
var gm = require("gm");
var request = require("request");

var links = require("./links");

// Convert a file
var convertFile = function(source, dest, options) {
	var d = Q.defer();
	options = _.defaults(options || {}, {
		resize: null
	});

	var img = gm(source)
	.options({
		imageMagick: true
	});

	if (options.resize)  img = img.resize(options.resize.w, options.resize.h);

	img.noProfile()
	.write(dest, function(err) {
		if (!err) return d.resolve();

		if (err.code == "ENOENT") {
			err = new Error("Need to install 'ImageMagick'");
		}
		d.reject(err);
	});

	return d.promise;
};

// Convert a file or url
var convert = function(source, dest, options) {
	if (links.isExternal(source)) source = request(source);

	return convertFile(source, dest, options);
};

module.exports = {
	convert: convert,
	INVALID: [".svg"]
};
