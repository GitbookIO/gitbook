var Q = require("q");
var _ = require("lodash");
var path = require("path");

var fs = require("./utils/fs");
var Configuration = require("./configuration");
var TemplateEngine = require("./template");
var parser = require("./parser");

var Book = function(root, options, parent) {
	// Root folder of the book
	this.root = root;

	// Parent book
	this.parent = parent;

	// Configuration
	this.config = new Configuration(this, options);
	Object.defineProperty(this, "options", {
		get: function () {
			return this.config.options;
		}
	});

	// Template
	this.template = new TemplateEngine(this);

	// Summary
	this.summary = {};

	// Glossary
	this.glossary = [];

	// Langs
	this.langs = [];
};

// Initialize and parse the book: config, summary, glossary
Book.prototype.init = function() {
	var that = this;
	var multilingal = false;

	return this.config.load()

	.then(function() {
		return that.parseLangs()
		.then(function() {
			multilingal = that.langs.length > 0;

			// Sub-books that inherit from the current book configuration
			that.books = _.map(that.langs, function(lang) {
				return new Book(
					path.join(that.root, lang.path),
					_.extend({}, that.options, {
						'output': path.join(that.options.output, lang.path),
						'lang': lang.lang
					}),
					that
				)
			});
		});
	})

	.then(function() {
		if (multilingal) return;
		return that.parseSummary();
	})
	.then(function() {
		if (multilingal) return;
		return that.parseGlossary();
	})
	.thenResolve(this);
};

// Generate the output
Book.prototype.generate = function() {
	var that = this;

	return this.init()
	.then(function() {

	});
};

// Parse langs
Book.prototype.parseLangs = function() {
	var that = this;

	return that.findFile(that.config.getStructure("langs"))
	.then(function(langs) {
		if (!langs) return [];

		return that.readFile(langs.path)
		.then(function(content) {
			return langs.parser.langs(content);
		});
	})
	.then(function(langs) {
		that.langs = langs;
	});
};

// Parse summary
Book.prototype.parseSummary = function() {
	var that = this;

	return that.findFile(that.config.getStructure("summary"))
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

// Parse glossary
Book.prototype.parseGlossary = function() {
	var that = this;

	return that.findFile(that.config.getStructure("glossary"))
	.then(function(glossary) {
		if (!glossary) return {};

		return that.readFile(glossary.path)
		.then(function(content) {
			return glossary.parser.glossary(content);
		});
	})
	.then(function(glossary) {
		that.glossary = glossaryy;
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
