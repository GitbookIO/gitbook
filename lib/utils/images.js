var _ = require("lodash");
var Q = require("q");
var fs = require("fs");
var gm = require("gm");


var convert = function(source, dest, options) {
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
	.write(dest, d.makeNodeResolver());

	return d.promise;
};

module.exports = {
	convert: convert,
	INVALID: [".svg"]
};
