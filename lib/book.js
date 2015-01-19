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

	// Sub-books
	this.books = [];
};

// Initialize and parse the book: config, summary, glossary
Book.prototype.parse = function() {
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
		return that.parseReadme();
	})
	.then(function() {
		if (multilingal) return;
		return that.parseSummary();
	})
	.then(function() {
		if (multilingal) return;
		return that.parseGlossary();
	})

	.then(function() {
		// Init sub-books
		return _.reduce(that.books, function(prev, book) {
			return prev.then(function() {
				return book.parse();
			});
		}, Q());
	})

	.thenResolve(this);
};

// Generate the output
Book.prototype.generate = function() {
	var that = this;

	return Q()
	.then(function() {

	});
};

// Parse readme to extract defaults title and description
Book.prototype.parseReadme = function() {
	var that = this;

	return that.findFile(that.config.getStructure("readme"))
	.then(function(readme) {
		if (!readme) throw "No README file";

		return that.template.renderFile(readme.path)
		.then(function(content) {
			return readme.parser.readme(content);
		});
	})
	.then(function(readme) {
		that.options.title = that.options.title || readme.title;
		that.options.description = that.options.description || readme.description;
	});
};


// Parse langs to extract list of sub-books
Book.prototype.parseLangs = function() {
	var that = this;

	return that.findFile(that.config.getStructure("langs"))
	.then(function(langs) {
		if (!langs) return [];

		return that.template.renderFile(langs.path)
		.then(function(content) {
			return langs.parser.langs(content);
		});
	})
	.then(function(langs) {
		that.langs = langs;
	});
};

// Parse summary to extract list of chapters
Book.prototype.parseSummary = function() {
	var that = this;

	return Q.all([
		that.findFile(that.config.getStructure("summary")),
		that.findFile(that.config.getStructure("readme"))
	])
	.spread(function(summary, readme) {
		if (!summary) throw "No SUMMARY file";

		return that.template.renderFile(summary.path)
		.then(function(content) {
			return summary.parser.summary(content, readme.path);
		});
	})
	.then(function(summary) {
		that.summary = summary;
	});
};

// Parse glossary to extract terms
Book.prototype.parseGlossary = function() {
	var that = this;

	return that.findFile(that.config.getStructure("glossary"))
	.then(function(glossary) {
		if (!glossary) return {};

		return that.template.renderFile(glossary.path)
		.then(function(content) {
			return glossary.parser.glossary(content);
		});
	})
	.then(function(glossary) {
		that.glossary = glossary;
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

// Return stat for a file
Book.prototype.statFile = function(filename) {
	return fs.stat(path.join(this.root, filename));
};

// Retrun true if the book is a multilingual book
Book.prototype.isMultilingual = function(filename) {
	return this.books.length > 0;
};

module.exports= Book;
