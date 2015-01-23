var Q = require("q");
var _ = require("lodash");
var path = require("path");
var lunr = require('lunr');
var parsers = require("gitbook-parsers");

var fs = require("./utils/fs");
var parseNavigation = require("./utils/navigation");
var parseProgress = require("./utils/progress");
var pageUtil = require("./utils/page");
var links = require("./utils/links");

var Configuration = require("./configuration");
var TemplateEngine = require("./template");
var Plugin = require("./plugin");

var generators = require("./generators");

var Book = function(root, context, parent) {
	this.context = _.defaults(context || {}, {
		// Extend book configuration
		config: {},

		// Log function
		log: console.log.bind(console),

		// Log level
		logLevel: Book.LOG_LEVELS.INFO
	})

	// Root folder of the book
	this.root = root;

	// Parent book
	this.parent = parent;

	// Configuration
	this.config = new Configuration(this, this.context.config);
	Object.defineProperty(this, "options", {
		get: function () {
			return this.config.options;
		}
	});

	// Template
	this.template = new TemplateEngine(this);

	// Summary
	this.summary = {};
	this.navigation = [];

	// Glossary
	this.glossary = [];

	// Langs
	this.langs = [];

	// Sub-books
	this.books = [];

	// Files in the book
	this.files = [];

	// List of plugins
	this.plugins = [];

	// Readme file
	this.readmeFile = "README.md";

	// Search Index
	this.searchIndex = lunr(function () {
        this.ref('url');

        this.field('title', { boost: 10 });
        this.field('body');
    });
};

Book.LOG_LEVELS = {
	DEBUG: 0,
	INFO: 1,
	WARNING: 2,
	ERROR: 3,
	DISABLED: 10
};

// Initialize and parse the book: config, summary, glossary
Book.prototype.parse = function() {
	var that = this;
	var multilingual = false;


	that.logDebug("start parsing configuration");
	return this.config.load()

	.then(function() {
		return that.parsePlugins();
	})

	.then(function() {
		return that.parseLangs()
		.then(function() {
			multilingual = that.langs.length > 0;
			if (multilingual) that.logInfo("Parsing multilingual book, with", that.langs.length, "lanuages");

			// Sub-books that inherit from the current book configuration
			that.books = _.map(that.langs, function(lang) {
				that.logInfo("Preparing language book", lang.lang);
				return new Book(
					path.join(that.root, lang.path),
					_.merge({}, that.context, {
						config: _.extend({}, that.options, {
							'output': path.join(that.options.output, lang.path),
							'language': lang.lang
						})
					}),
					that
				)
			});
		});
	})

	.then(function() {
		if (multilingual) return;
		return that.listAllFiles();
	})
	.then(function() {
		if (multilingual) return;
		return that.parseReadme();
	})
	.then(function() {
		if (multilingual) return;
		return that.parseSummary();
	})
	.then(function() {
		if (multilingual) return;
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
Book.prototype.generate = function(generator) {
	var that = this;
	that.options.generator = generator || that.options.generator;

	that.logInfo("start generation with", that.options.generator, "generator");
	return Q()

	// Clean output folder
	.then(function() {
		return fs.remove(that.options.output);
	})
	.then(function() {
        return fs.mkdirp(that.options.output);
    })

	// Create generator
	.then(function() {
		var Generator = generators[generator];
		if (!Generator) throw "Generator '"+that.options.generator+"' doesn't exist";
		generator = new Generator(that);

		return generator.prepare();
	})

	// Generate content
	.then(function() {
		if (that.isMultilingual()) {
			return that.generateMultiLingual(generator);
		} else {
			// Copy file and replace markdown file
            return Q.all(
                _.chain(that.files)
                .map(function(file) {
                    if (!file) return;

                    if (file[file.length -1] == "/") {
                    	that.logDebug("transferring folder", file);
                        return Q(generator.transferFolder(file));
                    } else if (_.contains(parsers.extensions, path.extname(file)) && that.navigation[file]) {
                    	that.logDebug("parsing", file);
                        return that.parsePage(file)
                        .then(function(content) {
							return Q(generator.writeParsedFile(content, file));
                        });
                    } else {
                    	that.logDebug("transferring file", file);
                        return Q(generator.transferFile(file));
                    }
                })
                .value()
            );
		}
	})

	// Finish generation
    .then(function() {
        return generator.callHook("finish:before");
    })
    .then(function() {
        return generator.finish();
    })
    .then(function() {
        return generator.callHook("finish");
    })
    .then(function() {
    	that.logInfo("generation is finished");
    });
};

// Generate the output for a multilingual book
Book.prototype.generateMultiLingual = function(generator) {
	var that = this;

	return Q()
	.then(function() {
		// Generate sub-books
		return _.reduce(that.books, function(prev, book) {
			return prev.then(function() {
				return book.generate(that.options.generator);
			});
		}, Q());
	})
	.then(function() {
		return generator.langsIndex(that.langs);
	});
};

// Parse list of plugins
Book.prototype.parsePlugins = function() {
	var that = this;
	var failed = [];

    // Load plugins
    that.plugins = _.map(that.options.plugins, function(plugin) {
        var plugin = new Plugin(that, plugin.name);
        if (!plugin.isValid()) failed.push(plugin.name);
        return plugin;
    });

    that.logDebug("load plugins:", that.plugins.length, "loaded, ", failed.length, "failed");
    if (_.size(failed) > 0) return Q.reject(new Error("Error loading plugins: "+failed.join(",")+". Run 'gitbook install' to install plugins from NPM."));
    return Q();
};

// Parse readme to extract defaults title and description
Book.prototype.parseReadme = function() {
	var that = this;
	var structure = that.config.getStructure("readme");
	that.logDebug("start parsing readme:", structure);

	return that.findFile(structure)
	.then(function(readme) {
		if (!readme) throw "No README file";
		if (!_.contains(that.files, readme.path)) throw "README file is ignored";

		that.readmeFile = readme.path;

		that.logDebug("readme located at", that.readmeFile);
		return that.template.renderFile(that.readmeFile)
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

	var structure = that.config.getStructure("langs");
	that.logDebug("start parsing languages index:", structure);

	return that.findFile(structure)
	.then(function(langs) {
		if (!langs) return [];

		that.logDebug("languages index located at", langs.path);
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

	var structure = that.config.getStructure("summary");
	that.logDebug("start parsing summary:", structure);

	return that.findFile(structure)
	.then(function(summary) {
		if (!summary) throw "No SUMMARY file";

		// Remove the summary from the list of files to parse
		that.files = _.without(that.files, summary.path);

		that.logDebug("summary located at", summary.path);
		return that.template.renderFile(summary.path)
		.then(function(content) {
			return summary.parser.summary(content, that.readmeFile);
		});
	})
	.then(function(summary) {
		that.summary = summary;
		that.navigation = parseNavigation(that.summary, that.files);
	});
};

// Parse glossary to extract terms
Book.prototype.parseGlossary = function() {
	var that = this;

	var structure = that.config.getStructure("glossary");
	that.logDebug("start parsing glossary: ", structure);

	return that.findFile(structure)
	.then(function(glossary) {
		if (!glossary) return [];

		// Remove the glossary from the list of files to parse
		that.files = _.without(that.files, glossary.path);

		that.logDebug("glossary located at", glossary.path);
		return that.template.renderFile(glossary.path)
		.then(function(content) {
			return glossary.parser.glossary(content);
		});
	})
	.then(function(glossary) {
		that.glossary = glossary;
	});
};

// Parse a page
Book.prototype.parsePage = function(filename) {
	var that = this;

	that.logDebug("start parsing file", filename);

	var extension = path.extname(filename);
	var filetype = parsers.get(extension);

	if (!filetype) return Q.reject(new Error("Can't parse file: "+filename));

	that.logDebug("render template", filename);
	return that.template.renderFile(filename)
	.then(function(content) {
		that.logDebug("use file parser", filetype.name, "for", filename);
		return filetype.parser.page(content);
	})
	.then(function(page) {
		// Type of parser used
		page.type = filetype.name;

		// Path relative to book
		page.path = filename;

		// Path absolute in the system
        page.rawPath = path.resolve(that.root, filename);

        // Progress in the book
		page.progress = parseProgress(that.navigation, filename);

		// Content sections
		page.sections = pageUtil.normalize(page.sections, {
			input: filename,
            navigation: that.navigation,
            base: path.dirname(filename) || './',
            output: path.dirname(filename) || './',
            glossary: that.glossary
        });

		return page;
	})
	.then(function(page) {
		that.indexPage(page);
		return page;
	});
};

// Find file that can be parsed with a specific filename
Book.prototype.findFile = function(filename) {
	var that = this;

	return _.reduce(parsers.extensions, function(prev, ext) {
		return prev.then(function(output) {
			// Stop if already find a parser
			if (output) return output;

			var filepath = filename+ext;

			return that.fileExists(filepath)
			.then(function(exists) {
				if (!exists) return null;
				return {
					parser: parsers.get(ext).parser,
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

// List all files in the book
Book.prototype.listAllFiles = function() {
	var that = this;

    return fs.list(this.root)
    .then(function(_files) {
        that.files = _files;
    });
};

// Return true if the book is a multilingual book
Book.prototype.isMultilingual = function(filename) {
	return this.books.length > 0;
};

// Return root of the parent
Book.prototype.parentRoot = function() {
	if (this.parent) return this.parent.parentRoot();
	return this.root;
};

// Normalize a link to .html and convert README -> index
Book.prototype.contentLink = function(link) {
    if (
        path.basename(link) == "README"
        || link == this.readmeFile
    ) {
        link = path.join(path.dirname(link), "index"+path.extname(link));
    }

    link = links.changeExtension(link, ".html");
    return link;
}

// Index a page into the search index
Book.prototype.indexPage = function(page) {
	var nav = this.navigation[page.path];
	if (!nav) return;

	this.logDebug("index page", page.path);
	this.searchIndex.add({
        url: this.contentLink(page.path),
        title: nav.title,
        body: pageUtil.extractText(page.sections),
    });
};

// Log message
Book.prototype.log = function(level) {
	if (level < this.context.logLevel) return;

	var args = Array.prototype.slice.apply(arguments);
	args[0] = _.findKey(Book.LOG_LEVELS, function(v) { return v == args[0]; }).toLowerCase()+":";
	this.context.log.apply(null, args);
};
Book.prototype.logDebug = _.partial(Book.prototype.log, Book.LOG_LEVELS.DEBUG);
Book.prototype.logInfo = _.partial(Book.prototype.log, Book.LOG_LEVELS.INFO);
Book.prototype.logWarn = _.partial(Book.prototype.log, Book.LOG_LEVELS.WARNING);
Book.prototype.logError = _.partial(Book.prototype.log, Book.LOG_LEVELS.ERROR);

module.exports= Book;
