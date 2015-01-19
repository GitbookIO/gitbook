var _ = require("lodash");
var path = require("path");

// This list is ordered by priority of parsers to use
var PARSER = [
	{
		extensions: [".md", ".markdown"],
		parser: require("gitbook-markdown")
	}
];

// Return a specific parser according to an extension
function getParser(ext) {
	return _.find(PARSER, function(input) {
		return _.contains(input.extensions, ext);
	});
}

// Return parser for a file
function getParserForFile(filename) {
	return getParser(path.extname(filename));
};

module.exports = {
	extensions: _.flatten(_.pluck(PARSER, "extensions")),
	get: getParser,
	getForFile: getParserForFile
};
