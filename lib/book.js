var Q = require("q");
var _ = require("lodash");
var path = require("path");
var util = require("util");
var lunr = require('lunr');
var parsers = require("gitbook-parsers");
var color = require('bash-color');

var fs = require("./utils/fs");
var parseNavigation = require("./utils/navigation");
var parseProgress = require("./utils/progress");
var pageUtil = require("./utils/page");
var links = require("./utils/links");
var logger = require("./utils/logger");

var Configuration = require("./configuration");
var TemplateEngine = require("./template");
var Plugin = require("./plugin");

var generators = require("./generators");

var Book = function(root, context, parent) {
	this.context = _.defaults(context || {}, {
		// Extend book configuration
		config: {},

		// Log function
		log: function(msg) {
			process.stdout.write(msg);
		},

		// Log level
		logLevel: Book.LOG_LEVELS.INFO
	});

	// Log
	this.log = logger(this.context.log, this.context.logLevel);

	// Root folder of the book
	this.root = path.resolve(root);

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

	// Structure files
    this.summaryFile = null;
    this.glossaryFile = null;
	this.readmeFile = null;
    this.langsFile = null;

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
Book.LOG_COLORS = {
	DEBUG: color.purple,
	INFO: color.cyan,
	WARNING: color.yellow,
	ERROR: color.red,
	DISABLED: 10
};

// Initialize and parse the book: config, summary, glossary
Book.prototype.parse = function() {
	var that = this;
	var multilingual = false;

	return this.parseConfig()

	.then(function() {
		return that.parsePlugins();
	})

	.then(function() {
		return that.parseLangs()
		.then(function() {
			multilingual = that.langs.length > 0;
			if (multilingual) that.log.info.ln("Parsing multilingual book, with", that.langs.length, "lanuages");

			// Sub-books that inherit from the current book configuration
			that.books = _.map(that.langs, function(lang) {
				that.log.info.ln("Preparing language book", lang.lang);
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

	that.log.info.ln("start generation with", that.options.generator, "generator");
	return Q()

	// Clean output folder
	.then(function() {
        that.log.info("clean", that.options.generator, "generator");
		return fs.clean(that.options.output)
        .progress(function(p) {
            that.log.debug.ln("remove", p.file, "("+p.i+"/"+p.count+")");
        })
        .then(function() {
            that.log.info.ok();
        });
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
                    	that.log.debug.ln("transferring folder", file);
                        return Q(generator.transferFolder(file));
                    } else if (_.contains(parsers.extensions, path.extname(file)) && that.navigation[file]) {
                    	that.log.debug.ln("converting", file);
                        return Q(generator.convertFile(file));
                    } else {
                    	that.log.debug.ln("transferring file", file);
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
    	that.log.info.ln("generation is finished");
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

// Extract files from ebook generated
Book.prototype.generateFile = function(output, options) {
	var book = this;

    options = _.defaults(options || {}, {
        ebookFormat: path.extname(output).slice(1)
    });
    output = output || path.resolve(book.root, "book."+options.ebookFormat);

    return fs.tmp.dir()
    .then(function(tmpDir) {
    	book.config.extend({
    		output: tmpDir
    	});

        return book.generate(options.ebookFormat)
        .then(function(_options) {
            var copyFile = function(lang) {
                var _outputFile = output;
                var _tmpDir = tmpDir;

                if (lang) {
                    _outputFile = _outputFile.slice(0, -path.extname(_outputFile).length)+"_"+lang+path.extname(_outputFile);
                    _tmpDir = path.join(_tmpDir, lang);
                }

                book.log.info("copy ebook to", output, "...");
                return fs.copy(
                    path.join(_tmpDir, "index."+options.ebookFormat),
                    _outputFile
                )
                .then(function() {
                	book.log.info.ok();
                });
            };

            // Multi-langs book
            return Q()
            .then(function() {
                if (book.isMultilingual()) {
                    return Q.all(
                        _.map(book.langs, function(lang) {
                            return copyFile(lang.lang);
                        })
                    );
                } else {
                    return copyFile();
                }
            })
            .then(function() {
                return fs.remove(tmpDir);
            });
        });
    });
};

// Parse configuration
Book.prototype.parseConfig = function() {
	var that = this;

	that.log.info("loading book configuration....")
	return that.config.load()
	.then(function() {
		that.log.info.ok();
	});
};

// Parse list of plugins
Book.prototype.parsePlugins = function() {
	var that = this;
	var failed = [];

    // Load plugins
    that.plugins = _.map(that.options.plugins, function(plugin) {
        var plugin = new Plugin(that, plugin.name);
        that.log.info("load plugin", plugin.name, "....");

        if (!plugin.isValid()) {
        	that.log.info.fail();
        	failed.push(plugin.name);
        } else {
        	that.log.info.ok();
        }
        return plugin;
    });

    if (_.size(failed) > 0) return Q.reject(new Error("Error loading plugins: "+failed.join(",")+". Run 'gitbook install' to install plugins from NPM."));

    that.log.info.ok(that.plugins.length+" plugins loaded");
    return Q();
};

// Parse readme to extract defaults title and description
Book.prototype.parseReadme = function() {
	var that = this;
	var structure = that.config.getStructure("readme");
	that.log.debug.ln("start parsing readme:", structure);

	return that.findFile(structure)
	.then(function(readme) {
		if (!readme) throw "No README file";
		if (!_.contains(that.files, readme.path)) throw "README file is ignored";

		that.readmeFile = readme.path;
        that._defaultsStructure(that.readmeFile);

		that.log.debug.ln("readme located at", that.readmeFile);
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
	that.log.debug.ln("start parsing languages index:", structure);

	return that.findFile(structure)
	.then(function(langs) {
		if (!langs) return [];

        that.langsFile = langs.path;
        that._defaultsStructure(that.langsFile);

		that.log.debug.ln("languages index located at", that.langsFile);
		return that.template.renderFile(that.langsFile)
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
	that.log.debug.ln("start parsing summary:", structure);

	return that.findFile(structure)
	.then(function(summary) {
		if (!summary) throw "No SUMMARY file";

		// Remove the summary from the list of files to parse
        that.summaryFile = summary.path;
        that._defaultsStructure(that.summaryFile);
		that.files = _.without(that.files, that.summaryFile);

		that.log.debug.ln("summary located at", that.summaryFile);
		return that.template.renderFile(that.summaryFile)
		.then(function(content) {
			return summary.parser.summary(content, {
				entryPoint: that.readmeFile,
				files: that.files
			});
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
	that.log.debug.ln("start parsing glossary: ", structure);

	return that.findFile(structure)
	.then(function(glossary) {
		if (!glossary) return [];

		// Remove the glossary from the list of files to parse
        that.glossaryFile = glossary.path;
        that._defaultsStructure(that.glossaryFile);
		that.files = _.without(that.files, that.glossaryFile);

		that.log.debug.ln("glossary located at", that.glossaryFile);
		return that.template.renderFile(that.glossaryFile)
		.then(function(content) {
			return glossary.parser.glossary(content);
		});
	})
	.then(function(glossary) {
		that.glossary = glossary;
	});
};

// Parse a page
Book.prototype.parsePage = function(filename, options) {
	var that = this, page = {};
    options = _.defaults(options || {}, {
        // Interpolate before templating
        interpolateTemplate: _.identity,

        // Interpolate after templating
        interpolateContent: _.identity
    });

    var interpolate = function(fn) {
        return Q(fn(page))
        .then(function(_page) {
            page = _page;
        });
    };

	that.log.debug.ln("start parsing file", filename);

	var extension = path.extname(filename);
	var filetype = parsers.get(extension);

	if (!filetype) return Q.reject(new Error("Can't parse file: "+filename));

    // Type of parser used
    page.type = filetype.name;

    // Path relative to book
    page.path = filename;

    // Path absolute in the system
    page.rawPath = path.resolve(that.root, filename);

    // Progress in the book
    page.progress = parseProgress(that.navigation, filename);

	that.log.debug.ln("render template", filename);

    // Read file content
    return that.readFile(page.path)
    .then(function(content) {
        page.content = content;

        return interpolate(options.interpolateTemplate);
    })

    // Generate template
    .then(function() {
        return that.template.renderPage(page);
    })

    // Parse markup
    .then(function(content) {
        page.content = content;

        that.log.debug.ln("use file parser", filetype.name, "for", filename);
        return filetype.parser.page(page.content);
    })

    // Prepare html
	.then(function(_page) {
		page.sections = pageUtil.normalize(_page.sections, {
			input: filename,
            navigation: that.navigation,
            base: path.dirname(filename) || './',
            output: path.dirname(filename) || './',
            glossary: that.glossary
        });

		return interpolate(options.interpolateContent);
	})

	.then(function() {
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

    return fs.list(this.root, {
        ignoreFiles: ['.ignore', '.gitignore', '.bookignore'],
        ignoreRules: [
            // Skip Git stuff
            '.git/',
            '.gitignore',

            // Skip OS X meta data
            '.DS_Store',

            // Skip stuff installed by plugins
            'node_modules',

            // Skip book outputs
            '_book',
            '*.pdf',
            '*.epub',
            '*.mobi',

            // Skip config files
            '.ignore',
            '.bookignore',
            'book.json',
        ]
    })
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

// Resolve a path in book
Book.prototype.resolve = function(p) {
    return path.resolve(this.root, p);
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

	this.log.debug.ln("index page", page.path);
	this.searchIndex.add({
        url: this.contentLink(page.path),
        title: nav.title,
        body: pageUtil.extractText(page.sections),
    });
};

// Default structure paths to an extension
Book.prototype._defaultsStructure = function(filename) {
    var that = this;
    var extension = path.extname(filename);

    that.readmeFile = that.readmeFile || that.config.getStructure("readme")+extension;
    that.summaryFile = that.summaryFile || that.config.getStructure("summary")+extension;
    that.glossaryFile = that.glossaryFile || that.config.getStructure("glossary")+extension;
    that.langsFile = that.langsFile || that.config.getStructure("langs")+extension;
}


// Init and return a book
Book.init = function(root) {
    var book = new Book(root);
    var extensionToUse = ".md";

    var chaptersPaths = function(chapters) {
        return _.reduce(chapters || [], function(accu, chapter) {
            if (!chapter.path) return accu;
            return accu.concat(
                _.filter([
                    {
                        title: chapter.title,
                        path: chapter.path
                    }
                ].concat(chaptersPaths(chapter.articles)))
            );
        }, []);
    };

    book.log.infoLn("init book at", root);
    return fs.mkdirp(root)
    .then(function() {
        book.log.infoLn("detect structure from SUMMARY (if it exists)");
        return book.parseSummary();
    })
    .fail(function() {
        return Q();
    })
    .then(function() {
        var summary = book.summaryFile || "SUMMARY.md";
        var chapters = book.summary.chapters || [];
        extensionToUse = path.extname(summary);

        if (chapters.length == 0) {
            chapters = [
                {
                    title: "Summary",
                    path: "SUMMARY"+extensionToUse
                },
                {
                    title: "Introduction",
                    path: "README"+extensionToUse
                }
            ];
        }

        return Q(chaptersPaths(chapters));
    })
    .then(function(chapters) {
        // Create files that don't exist
        return Q.all(_.map(chapters, function(chapter) {
            var absolutePath = path.resolve(book.root, chapter.path);

            return fs.exists(absolutePath)
            .then(function(exists) {
                book.log.infoLn("create", chapter.path);
                if(exists) return;

                return fs.mkdirp(path.dirname(absolutePath))
                .then(function() {
                    return fs.writeFile(absolutePath, '# '+chapter.title+'\n');
                });
            });
        }));
    })
    .then(function() {
        book.log.infoLn("initialization is finished");
    });
};

module.exports= Book;
