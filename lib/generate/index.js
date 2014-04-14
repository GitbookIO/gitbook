var Q = require("q");
var _ = require("lodash");
var path = require("path");
var swig = require('swig');
var tmp = require('tmp');

var fs = require("./fs");
var parse = require("../parse");

var generators = {
    "site": require("./site"),
    "page": require("./page"),
    "pdf": require("./pdf"),
    "ebook": require("./ebook"),
    "json": require("./json")
};

var defaultDescription = "Book generated using GitBook";

/*
 *  Use a specific generator to convert a gitbook to a site/pdf/ebook/
 *  output is always a folder
 */
var generate = function(options) {
    var generator = null;
    var files;

    options = _.defaults(options || {}, {
        // Folders to use
        input: null,
        output: null,

        // Output generator
        generator: "site",

        // Book title, keyword, description
        title: null,
        description: null,

        // Origin github repository id
        github: null,
        githubHost: 'https://github.com/',

        // Theming
        theme: path.resolve(__dirname, '../../theme')
    });

    if (!options.input) {
        return Q.reject(new Error("Need option input (book input directory)"));
    }

    if (!generators[options.generator]) {
        return Q.reject(new Error("Invalid generator (availables are: "+_.keys(generators).join(", ")));
    }

    options.output = options.output || path.join(options.input, "_book");

    // Clean output folder
    return fs.remove(options.output)

    .then(function() {
        return fs.mkdirp(options.output);
    })

    // List all files in the repository
    .then(function() {
        return fs.list(options.input)
        .then(function(_files) {
            files = _files;
        })
    })

    // Create the generator
    .then(function() {
        generator = new generators[options.generator](options);
    })

    // Detect multi-languages book
    .then(function() {
        if (_.contains(files, "LANGS.md")) {
            // Multi-languages book
            return fs.readFile(path.join(options.input, "LANGS.md"), "utf-8")

            // Generate sub-books
            .then(function(_langsSummary) {
                options.langsSummary = parse.langs(_langsSummary);

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

            // Generate languages index
            .then(function() {
                return generator.langsIndex(options.langsSummary);
            });
        } else if (!_.contains(files, "SUMMARY.md") || !_.contains(files, "README.md")) {
            // Invalid book
            return Q.reject(new Error("Invalid gitbook repository, need SUMMARY.md and README.md"));
        } else {
            // Generate the book
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

            // Get summary
            .then(function() {
                return fs.readFile(path.join(options.input, "SUMMARY.md"), "utf-8")
                .then(function(_summary) {
                    options.summary = parse.summary(_summary);

                    // Parse navigation
                    options.navigation = parse.navigation(options.summary);
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

            // Finish gneration
            .then(function() {
                return generator.finish();
            });
        }
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
    file: generateFile
};
