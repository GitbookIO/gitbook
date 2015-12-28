var Q = require('q');
var _ = require('lodash');
var path = require('path');
var parsers = require('gitbook-parsers');

var fs = require('./utils/fs');
var parseNavigation = require('./utils/navigation');
var parseProgress = require('./utils/progress');
var pageUtil = require('./utils/page');
var pathUtil = require('./utils/path');
var links = require('./utils/links');
var i18n = require('./utils/i18n');
var logger = require('./utils/logger');

var Configuration = require('./configuration');
var TemplateEngine = require('./template');
var PluginsList = require('./pluginslist');

var generators = require('./generators');

var Book = function(root, context, parent) {
    this.context = _.defaults(context || {}, {
        // Extend book configuration
        config: {},

        // Log function
        log: function(msg) {
            process.stdout.write(msg);
        },

        // Log level
        logLevel: 'info'
    });

    // Log
    this.log = logger(this.context.log, this.context.logLevel);

    // Root folder of the book
    this.root = path.resolve(root);

    // Parent book
    this.parent = parent;

    // Configuration
    this.config = new Configuration(this, this.context.config);
    Object.defineProperty(this, 'options', {
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
    this.plugins = new PluginsList(this);

    // Structure files
    this.summaryFile = null;
    this.glossaryFile = null;
    this.readmeFile = null;
    this.langsFile = null;

    // Bind methods
    _.bindAll(this);
};

// Return string representation
Book.prototype.toString = function() {
    return '[Book '+this.root+']';
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
            if (multilingual) that.log.info.ln('Parsing multilingual book, with', that.langs.length, 'languages');

            // Sub-books that inherit from the current book configuration
            that.books = _.map(that.langs, function(lang) {
                that.log.info.ln('Preparing language book', lang.lang);
                return new Book(
                    path.join(that.root, lang.path),
                    _.merge({}, that.context, {
                        config: _.extend({}, that.options, {
                            'output': path.join(that.options.output, lang.lang),
                            'language': lang.lang
                        })
                    }),
                    that
                );
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

    that.log.info.ln('start generation with', that.options.generator, 'generator');
    return Q()

    // Clean output folder
    .then(function() {
        that.log.info('clean', that.options.generator, 'generator');
        return fs.clean(that.options.output)
        .progress(function(p) {
            that.log.debug.ln('remove', p.file, '('+p.i+'/'+p.count+')');
        })
        .then(function() {
            that.log.info.ok();
        });
    })

    // Create generator
    .then(function() {
        var Generator = generators[generator];
        if (!Generator) throw 'Generator \''+that.options.generator+'\' doesn\'t exist';
        generator = new Generator(that);

        return generator.prepare();
    })

    // Transform configuration
    .then(function() {
        return that.callHook('config', that.config.dump())
        .then(function(newConfig) {
            that.config.replace(newConfig);
        });
    })

    // Generate content
    .then(function() {
        if (that.isMultilingual()) {
            return that.generateMultiLingual(generator);
        } else {
            // Separate list of files into the different operations needed
            var ops = _.groupBy(that.files, function(file) {
                if (file[file.length -1] == '/') {
                    return 'directories';
                } else if (_.contains(parsers.extensions, path.extname(file)) && that.navigation[file]) {
                    return 'content';
                } else {
                    return 'files';
                }
            });


            return Q()

            // First, let's create folder
            .then(function() {
                return _.reduce(ops.directories || [], function(prev, folder) {
                    return prev.then(function() {
                        that.log.debug.ln('transferring folder', folder);
                        return Q(generator.transferFolder(folder));
                    });
                }, Q());
            })

            // Then, let's copy other files
            .then(function() {
                return Q.all(_.map(ops.files || [], function(file) {
                    that.log.debug.ln('transferring file', file);
                    return Q(generator.transferFile(file));
                }));
            })

            // Finally let's generate content
            .then(function() {
                var nFiles = (ops.content || []).length;
                return _.reduce(ops.content || [], function(prev, file, i) {
                    return prev.then(function() {
                        var p = ((i*100)/nFiles).toFixed(0)+'%';
                        that.log.debug.ln('processing', file, p);

                        return Q(generator.convertFile(file))
                        .fail(function(err) {
                            // Transform error message to signal file
                            throw that.normError(err, {
                                fileName: file
                            });
                        });
                    });
                }, Q());
            });
        }
    })

    // Finish generation
    .then(function() {
        return that.callHook('finish:before');
    })
    .then(function() {
        return generator.finish();
    })
    .then(function() {
        return that.callHook('finish');
    })
    .then(function() {
        that.log.info.ln('generation is finished');
    });
};

// Generate the output for a multilingual book
Book.prototype.generateMultiLingual = function() {
    var that = this;

    return Q()
    .then(function() {
        // Generate sub-books
        return _.reduce(that.books, function(prev, book) {
            return prev.then(function() {
                return book.generate(that.options.generator);
            });
        }, Q());
    });
};

// Extract files from ebook generated
Book.prototype.generateFile = function(output, options) {
    var book = this;

    options = _.defaults(options || {}, {
        ebookFormat: path.extname(output).slice(1)
    });
    output = output || path.resolve(book.root, 'book.'+options.ebookFormat);

    return fs.tmp.dir()
    .then(function(tmpDir) {
        book.setOutput(tmpDir);

        return book.generate(options.ebookFormat)
        .then(function() {
            var copyFile = function(lang) {
                var _outputFile = output;
                var _tmpDir = tmpDir;

                if (lang) {
                    _outputFile = _outputFile.slice(0, -path.extname(_outputFile).length)+'_'+lang+path.extname(_outputFile);
                    _tmpDir = path.join(_tmpDir, lang);
                }

                book.log.debug.ln('copy ebook to', _outputFile);
                return fs.copy(
                    path.join(_tmpDir, 'index.'+options.ebookFormat),
                    _outputFile
                );
            };

            // Multi-langs book
            return Q()
            .then(function() {
                if (book.isMultilingual()) {
                    return Q.all(
                        _.map(book.langs, function(lang) {
                            return copyFile(lang.lang);
                        })
                    )
                    .thenResolve(book.langs.length);
                } else {
                    return copyFile().thenResolve(1);
                }
            })
            .then(function(n) {
                book.log.info.ok(n+' file(s) generated');

                return fs.remove(tmpDir);
            });
        });
    });
};

// Parse configuration
Book.prototype.parseConfig = function() {
    var that = this;

    that.log.info('loading book configuration....');
    return that.config.load()
    .then(function() {
        that.log.info.ok();
    });
};

// Parse list of plugins
Book.prototype.parsePlugins = function() {
    var that = this;

    // Load plugins
    return that.plugins.load(that.options.plugins)
    .then(function() {
        if (_.size(that.plugins.failed) > 0) return Q.reject(new Error('Error loading plugins: '+that.plugins.failed.join(',')+'. Run \'gitbook install\' to install plugins from NPM.'));

        that.log.info.ok(that.plugins.count()+' plugins loaded');
        that.log.debug.ln('normalize plugins list');
    });
};

// Parse readme to extract defaults title and description
Book.prototype.parseReadme = function() {
    var that = this;
    var filename = that.config.getStructure('readme', true);
    that.log.debug.ln('start parsing readme:', filename);

    return that.findFile(filename)
    .then(function(readme) {
        if (!readme) throw 'No README file';
        if (!_.contains(that.files, readme.path)) throw 'README file is ignored';

        that.readmeFile = readme.path;
        that._defaultsStructure(that.readmeFile);

        that.log.debug.ln('readme located at', that.readmeFile);
        return that.template.renderFile(that.readmeFile)
        .then(function(content) {
            return readme.parser.readme(content)
            .fail(function(err) {
                throw that.normError(err, {
                    name: err.name || 'Readme Parse Error',
                    fileName: that.readmeFile
                });
            });
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

    var filename = that.config.getStructure('langs', true);
    that.log.debug.ln('start parsing languages index:', filename);

    return that.findFile(filename)
    .then(function(langs) {
        if (!langs) return [];

        that.langsFile = langs.path;
        that._defaultsStructure(that.langsFile);

        that.log.debug.ln('languages index located at', that.langsFile);
        return that.template.renderFile(that.langsFile)
        .then(function(content) {
            return langs.parser.langs(content)
            .fail(function(err) {
                throw that.normError(err, {
                    name: err.name || 'Langs Parse Error',
                    fileName: that.langsFile
                });
            });
        });
    })
    .then(function(langs) {
        that.langs = langs;
    });
};

// Parse summary to extract list of chapters
Book.prototype.parseSummary = function() {
    var that = this;

    var filename = that.config.getStructure('summary', true);
    that.log.debug.ln('start parsing summary:', filename);

    return that.findFile(filename)
    .then(function(summary) {
        if (!summary) throw 'No SUMMARY file';

        // Remove the summary from the list of files to parse
        that.summaryFile = summary.path;
        that._defaultsStructure(that.summaryFile);
        that.files = _.without(that.files, that.summaryFile);

        that.log.debug.ln('summary located at', that.summaryFile);
        return that.template.renderFile(that.summaryFile)
        .then(function(content) {
            return summary.parser.summary(content, {
                entryPoint: that.readmeFile,
                entryPointTitle: that.i18n('SUMMARY_INTRODUCTION'),
                files: that.files
            })
            .fail(function(err) {
                throw that.normError(err, {
                    name: err.name || 'Summary Parse Error',
                    fileName: that.summaryFile
                });
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

    var filename = that.config.getStructure('glossary', true);
    that.log.debug.ln('start parsing glossary: ', filename);

    return that.findFile(filename)
    .then(function(glossary) {
        if (!glossary) return [];

        // Remove the glossary from the list of files to parse
        that.glossaryFile = glossary.path;
        that._defaultsStructure(that.glossaryFile);
        that.files = _.without(that.files, that.glossaryFile);

        that.log.debug.ln('glossary located at', that.glossaryFile);
        return that.template.renderFile(that.glossaryFile)
        .then(function(content) {
            return glossary.parser.glossary(content)
            .fail(function(err) {
                throw that.normError(err, {
                    name: err.name || 'Glossary Parse Error',
                    fileName: that.glossaryFile
                });
            });
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
        // Transform svg images
        convertImages: false,

        // Interpolate before templating
        interpolateTemplate: _.identity,

        // Interpolate after templating
        interpolateContent: _.identity
    });

    var interpolate = function(fn) {
        return Q(fn(page))
        .then(function(_page) {
            page = _page || page;
        });
    };

    that.log.debug.ln('start parsing file', filename);

    var extension = path.extname(filename);
    var filetype = parsers.get(extension);

    if (!filetype) return Q.reject(new Error('Can\'t parse file: '+filename));

    // Type of parser used
    page.type = filetype.name;

    // Path relative to book
    page.path = filename;

    // Path absolute in the system
    page.rawPath = path.resolve(that.root, filename);

    // Progress in the book
    page.progress = parseProgress(that.navigation, filename);

    that.log.debug.ln('render template', filename);

    // Read file content
    return that.readFile(page.path)
    .then(function(content) {
        page.content = content;

        return interpolate(options.interpolateTemplate);
    })

    // Prepare page markup
    .then(function() {
        return filetype.page.prepare(page.content)
        .then(function(content) {
            page.content = content;
        });
    })

    // Generate template
    .then(function() {
        return that.template.renderPage(page);
    })

    // Prepare and Parse markup
    .then(function(content) {
        page.content = content;

        that.log.debug.ln('use file parser', filetype.name, 'for', filename);
        return filetype.page(page.content);
    })

    // Post process sections
    .then(function(_page) {
        return _.reduce(_page.sections, function(prev, section) {
            return prev.then(function(_sections) {
                return that.template.postProcess(section.content || '')
                .then(function(content) {
                    section.content = content;
                    return _sections.concat([section]);
                });
            });
        }, Q([]));
    })

    // Prepare html
    .then(function(_sections) {
        return pageUtil.normalize(_sections, {
            book: that,
            convertImages: options.convertImages,
            input: filename,
            navigation: that.navigation,
            base: path.dirname(filename) || './',
            output: path.dirname(filename) || './',
            glossary: that.glossary
        });
    })

    // Interpolate output
    .then(function(_sections) {
        page.sections = _sections;
        return interpolate(options.interpolateContent);
    })

    .then(function() {
        return page;
    });
};

// Find file that can be parsed with a specific filename
Book.prototype.findFile = function(filename) {
    var that = this;

    var ext = path.extname(filename);
    var basename = path.basename(filename, ext);

    // Ordered list of extensions to test
    var exts = parsers.extensions;
    if (ext) exts = _.uniq([ext].concat(exts));

    return _.reduce(exts, function(prev, ext) {
        return prev.then(function(output) {
            // Stop if already find a parser
            if (output) return output;

            var filepath = basename+ext;

            return fs.findFile(that.root, filepath)
            .then(function(realFilepath) {
                if (!realFilepath) return null;

                return {
                    parser: parsers.get(ext),
                    path: realFilepath
                };
            });
        });
    }, Q(null));
};

// Format a string using a specific markup language
Book.prototype.formatString = function(extension, content) {
    return Q()
    .then(function() {
        var filetype = parsers.get(extension);
        if (!filetype) throw new Error('Filetype doesn\'t exist: '+filetype);

        return filetype.page(content);
    })

    // Merge sections
    .then(function(page) {
        return _.reduce(page.sections, function(content, section) {
            return content + section.content;
        }, '');
    });
};

// Check if a file exists in the book
Book.prototype.fileExists = function(filename) {
    return fs.exists(
        this.resolve(filename)
    );
};

// Check if a file path is inside the book
Book.prototype.fileIsInBook = function(filename) {
    return pathUtil.isInRoot(this.root, filename);
};

// Read a file
Book.prototype.readFile = function(filename) {
    return fs.readFile(
        this.resolve(filename),
        { encoding: 'utf8' }
    );
};

// Return stat for a file
Book.prototype.statFile = function(filename) {
    return fs.stat(this.resolve(filename));
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
Book.prototype.isMultilingual = function() {
    return this.books.length > 0;
};

// Return root of the parent
Book.prototype.parentRoot = function() {
    if (this.parent) return this.parent.parentRoot();
    return this.root;
};

// Return true if it's a sub-book
Book.prototype.isSubBook = function() {
    return !!this.parent;
};

// Test if the file is the entry point
Book.prototype.isEntryPoint = function(fp) {
    return fp == this.readmeFile;
};

// Alias to book.config.get
Book.prototype.getConfig = function(key, def) {
    return this.config.get(key, def);
};

// Resolve a path in the book source
// Enforce that the output path in the root folder
Book.prototype.resolve = function() {
    return pathUtil.resolveInRoot.apply(null, [this.root].concat(_.toArray(arguments)));
};

// Resolve a path in the book output
// Enforce that the output path in the output folder
Book.prototype.resolveOutput = function() {
    return pathUtil.resolveInRoot.apply(null, [this.options.output].concat(_.toArray(arguments)));
};

// Convert an abslute path into a relative path to this
Book.prototype.relative = function(p) {
    return path.relative(this.root, p);
};

// Normalize a path to .html and convert README -> index
Book.prototype.contentPath = function(link) {
    if (
        path.basename(link, path.extname(link)) == 'README' ||
        link == this.readmeFile
    ) {
        link = path.join(path.dirname(link), 'index'+path.extname(link));
    }

    link = links.changeExtension(link, '.html');
    return link;
};

// Normalize a link to .html and convert README -> index
Book.prototype.contentLink = function(link) {
    return links.normalize(this.contentPath(link));
};

// Default structure paths to an extension
Book.prototype._defaultsStructure = function(filename) {
    var that = this;
    var extension = path.extname(filename);

    that.readmeFile = that.readmeFile || that.config.getStructure('readme')+extension;
    that.summaryFile = that.summaryFile || that.config.getStructure('summary')+extension;
    that.glossaryFile = that.glossaryFile || that.config.getStructure('glossary')+extension;
    that.langsFile = that.langsFile || that.config.getStructure('langs')+extension;
};

// Change output path
Book.prototype.setOutput = function(p) {
    var that = this;
    this.options.output = path.resolve(p);

    _.each(this.books, function(book) {
        book.setOutput(path.join(that.options.output, book.options.language));
    });
};

// Translate a strign according to the book language
Book.prototype.i18n = function() {
    var args = Array.prototype.slice.call(arguments);
    return i18n.__.apply({}, [this.config.normalizeLanguage()].concat(args));
};

// Normalize error
Book.prototype.normError = function(err, opts, defs) {
    if (_.isString(err)) err = new Error(err);

    // Extend err
    _.extend(err, opts || {});
    _.defaults(err, defs || {});

    err.lineNumber = err.lineNumber || err.lineno;
    err.columnNumber = err.columnNumber || err.colno;

    err.toString = function() {
        var attributes = [];

        if (this.fileName) attributes.push('In file \''+this.fileName+'\'');
        if (this.lineNumber) attributes.push('Line '+this.lineNumber);
        if (this.columnNumber) attributes.push('Column '+this.columnNumber);
        return (this.name || 'Error')+': '+this.message+((attributes.length > 0)? ' ('+attributes.join(', ')+')' : '');
    };

    return err;
};

// Call a hook in plugins
Book.prototype.callHook = function(name, data) {
    return this.plugins.hook(name, data);
};

module.exports= Book;
