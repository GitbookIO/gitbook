var Q = require("q");
var _ = require("lodash");
var path = require("path");
var swig = require('swig');
var tmp = require('tmp');

var fs = require("./fs");
var parse = require("../parse");
var Plugin = require("./plugin");

var generators = {
    "site": require("./site"),
    "page": require("./page"),
    "pdf": require("./pdf"),
    "ebook": require("./ebook"),
    "json": require("./json")
};

var defaultDescription = "Book generated using GitBook";


var containsFiles = function(dir, files) {
    return Q.all(_.map(files, function(file) {
        return fs.exists(path.join(dir, file));
    }))
    .then(_.all);
};


// Create the generator and load plugins
var loadGenerator = function(options) {
    var generator = new generators[options.generator](options);

    return generator.loadPlugins()
    .then(_.constant(generator));
};



var generate = function(options) {
    // Set defaults to options
    options = _.defaults(options || {}, {
        // Folders to use
        "input": null,
        "output": null,

        // Config file (relative to input)
        "configFile": "book.json",

        // Output generator
        "generator": "site",

        // Book title, keyword, description
        "title": null,
        "description": null,

        // Origin github repository id
        "github": null,
        "githubHost": 'https://github.com/',

        // Theming
        "theme": path.resolve(__dirname, '../../theme'),

        // Plugins
        "plugins": [],
        "pluginsConfig": {},

        // Links
        "links": {
            "about": null,
            "issues": null,
            "contribue": null,
        }
    });

    // Validate options
    if (!options.input) {
        return Q.reject(new Error("Need option input (book input directory)"));
    }

    // Ensure generator exists
    if (!generators[options.generator]) {
        return Q.reject(new Error("Invalid generator (availables are: "+_.keys(generators).join(", ")));
    }

    // Check files to get folder type (book, multilanguage book or neither)
    return Q()

    // Read readme
    .then(function() {
        return fs.readFile(path.join(options.input, "README.md"), "utf-8")
        .then(function(_readme) {
            _readme = parse.readme(_readme);

            options.title = options.title || _readme.title;
            options.description = options.description || _readme.description || defaultDescription;
        });
    })

    // Detect multi-languages book
    .then(function() {
        return containsFiles(options.input, ['LANGS.md'])
    })

    .then(function(isMultiLang) {
        // Multi language book
        if(isMultiLang) {
            return generateMultiLang(options);
        }

        // Book
        return generateBook(options);
    });
};


var generateMultiLang = function(options) {
    var langsSummary;
    options.output = options.output || path.join(options.input, "_book");

    // Multi-languages book
    return fs.readFile(path.join(options.input, "LANGS.md"), "utf-8")

    // Clean output folder
    .then(function(_langsSummary) {
        langsSummary = _langsSummary;
        return fs.remove(options.output);
    })
    .then(function() {
        return fs.mkdirp(options.output);
    })

    // Generate sub-books
    .then(function() {
        options.langsSummary = parse.langs(langsSummary);

        // Generated a book for each valid entry
        return Q.all(
            _.map(options.langsSummary.list, function(entry) {
                return generate(_.extend({}, options, {
                    input: path.join(options.input, entry.path),
                    output: path.join(options.output, entry.path)
                }));
            })
        );
    })

    .then(function() {
        return loadGenerator(options);
    })

    // Generate languages index
    .then(function(generator) {
        return generator.langsIndex(options.langsSummary);
    })

    // Return options to caller
    .then(_.constant(options));
};

/*
 *  Use a specific generator to convert a gitbook to a site/pdf/ebook/
 *  output is always a folder
 */
var generateBook = function(options) {
    var files;

    options.output = options.output || path.join(options.input, "_book");

    // Check if it's a book
    return containsFiles(options.input, ['SUMMARY.md', 'README.md'])

    // Fail if not a book
    .then(function(isBook) {
        if(!isBook) {
            return Q.reject(new Error("Invalid gitbook repository, need SUMMARY.md and README.md"));
        }
    })

    // Read config file
    .then(function() {
        return fs.readFile(path.resolve(options.input, options.configFile))
        .then(function(_config) {
            // Extend current config
            _config = JSON.parse(_config);
            _config = _.omit(_config, 'input', 'configFile');

            _.extend(options, _config);
        }, function() {
            // No config file: not a big deal
            return Q();
        });
    })

    // Clean output folder
    .then(function() {
        return fs.remove(options.output);
    })

    // Get repo's URL
    .then(function() {
        // Git deactivated
        if(options.github === false) {
            options.github = null;
            return null;
        } else if(options.github) {
        // Git already specified in options
            return options.github;
        }

        // Try auto detecting
        return parse.git.url(options.input)
        .then(function(_url) {
            // Get ID of repo
            return parse.git.githubID(_url);
        }, function(err) {
            return null;
        })
        .then(function(repoId) {
            options.github = repoId;
        });
    })

    .then(function() {
        return fs.mkdirp(options.output);
    })

    // List all files in the repository
    .then(function() {
        return fs.list(options.input)
        .then(function(_files) {
            files = _files;
        });
    })

    .then(function() {
        return loadGenerator(options);
    })

    // Detect multi-languages book
    .then(function(generator) {
        // Generate the book
        return Q()

        // Get summary
        .then(function() {
            return fs.readFile(path.join(options.input, "SUMMARY.md"), "utf-8")
            .then(function(_summary) {
                options.summary = parse.summary(_summary);

                // Parse navigation
                options.navigation = parse.navigation(options.summary);
            });
        })

        // Skip processing some files
        .then(function() {
            files = _.filter(files, function (file) {
                return !(
                    file === 'SUMMARY.md'
                );
            });
        })

        // Copy file and replace markdown file
        .then(function() {
            return Q.all(
                _.chain(files)
                .map(function(file) {
                    if (!file) return;

                    if (file[file.length -1] == "/") {
                        return Q(generator.transferFolder(file));
                    } else if (path.extname(file) == ".md" && options.navigation[file] != null) {
                        return fs.readFile(path.join(options.input, file), "utf-8")
                        .then(function(content) {
                            return Q(generator.convertFile(content, file));
                        });
                    } else {
                        return Q(generator.transferFile(file));
                    }
                })
                .value()
            );
        })

        // Finish generation
        .then(function() {
            return generator.finish();
        })
        .then(function() {
            return generator.callHook("finish");
        });
    })

    // Return all options
    .then(function() {
        return options;
    });
};

/*
 *  Extract files from generate output in a temporary folder
 */
var generateFile = function(options) {
    options = _.defaults(options || {}, {
        input: null,
        output: null,
        extension: null
    });

    return Q.nfcall(tmp.dir)
    .then(function(tmpDir) {
        return generate(
            _.extend({},
                options,
                {
                    output: tmpDir
                })
        )
        .then(function(_options) {
            var ext = options.extension;
            var outputFile = options.output || path.resolve(options.input, "book."+ext);

            var copyFile = function(lang) {
                var _outputFile = outputFile;
                var _tmpDir = tmpDir;

                if (lang) {
                    _outputFile = _outputFile.slice(0, -path.extname(_outputFile).length)+"_"+lang+path.extname(_outputFile);
                    _tmpDir = path.join(_tmpDir, lang);
                }

                return fs.copy(
                    path.join(_tmpDir, "index."+ext),
                    _outputFile
                );
            };

            // Multi-langs book
            return Q()
            .then(function() {
                if (_options.langsSummary) {
                    return Q.all(
                        _.map(_options.langsSummary.list, function(lang) {
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

module.exports = {
    generators: generators,
    folder: generate,
    file: generateFile,
    book: generateBook,
    Plugin: Plugin,
};
