var Q = require("q");
var _ = require("lodash");
var path = require("path");

var fs = require("./utils/fs");
var Configuration = require("./configuration");
var parser = require("./parser");

var Book = function(root) {
	// Root folder of the book
	this.root = root;

	// Configuration
	this.config = new Configuration(this);
	Object.defineProperty(this, "options", {
		get: function () {
			return this.config.options;
		}
	});

	// Summary
	this.summary = [];
};

// Initialize and parse the book: config, summary, glossary
Book.prototype.init = function() {
	var that = this;

	return this.config.load()
	.then(function() {

	})
	.thenResolve(this);
};

// Parse summary
Book.prototype.parseSummary = function() {
	var that = this;

	return that.findFile("SUMMARY")
	.then(function(summary) {
		if (!summary) throw "No SUMMARY file";

		return that.readFile(summary.path)
		.then(function(content) {
			return summary.parser.summary(content);
		});
	})
	.then(function(summary) {
		that.summary = summary;
	});
};

// Find file that can be parsed with a specific filename
Book.prototype.findFile = function(filename) {
	var that = this;

	return _.reduce(parser.extensions, function(prev, ext) {
		return prev.then(function(output) {
			// Stop if already find a parser
			if (output) return output;

			var filepath = filename+ext;

			return that.fileExists(filepath)
			.then(function(exists) {
				if (!exists) return null;
				return {
					parser: parser.get(ext).parser,
					path: filepath
				};
			})
		});
	}, Q(null));
};

// Check if a file exists in the book
Book.prototype.fileExists = function(filename) {
	return fs.exists(
		path.join(this.root, filename)
	);
};

// Read a file
Book.prototype.readFile = function(filename) {
	return fs.readFile(
		path.join(this.root, filename),
		{ encoding: "utf8" }
	);
};

module.exports= Book;
