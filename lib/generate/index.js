var Q = require("q");
var _ = require("lodash");

var path = require("path");

var fs = require("./fs");
var parse = require("../parse");
var template = require("./template");

var generators = {
    "site": require("./generator_site"),
    "json": require("./generator_json")
};

var generate = function(root, output, options) {
    var generator = null;
    var files, summary, navigation, tpl;

    options = _.defaults(options || {}, {
        generator: "site",

        // Book title, keyword, description
        title: null,
        description: "Book generated using GitBook",

        // Origin github repository id
        github: null,
        githubHost: 'https://github.com/'
    });

    if (!options.github || !options.title) {
        return Q.reject(new Error("Need options.github and options.title"));
    }

    if (!generators[options.generator]) {
        return Q.reject(new Error("Invalid generator (availables are: "+_.keys(generators).join(", ")));
    }

    // Clean output folder
    return fs.remove(output)

    .then(function() {
        return fs.mkdirp(output);
    })

    // List all files in the repository
    .then(function() {
        return fs.list(root);
    })

    // Check repository is valid
    .then(function(_files) {
        files = _files;

        if (!_.contains(files, "SUMMARY.md") || !_.contains(files, "README.md")) {
            return Q.reject(new Error("Invalid gitbook repository, need SUMMARY.md and README.md"));
        }
    })

    // Get summary
    .then(function() {
        return fs.readFile(path.join(root, "SUMMARY.md"), "utf-8")
        .then(function(_summary) {
            summary = parse.summary(_summary);

            // Parse navigation
            navigation = parse.navigation(summary);
        });
    })

    // Create the generator
    .then(function() {
        generator = new generators[options.generator]();
    })

    // Copy file and replace markdown file
    .then(function() {
        return Q.all(
            _.chain(files)
            .map(function(file) {
                if (!file) return;

                if (file[file.length -1] == "/") {
                    return generator.transferFolder(file);
                } else if (path.extname(file) == ".md" && navigation[file] != null) {
                    return generator.convertFile(file);
                } else {
                    return generator.transferFile(file);
                }
            })
            .value()
        );
    })

    // Finish gneration
    .then(function() {
        return generator.finish();
    });
};

module.exports = {
    generators: generators,
    folder: generate
};
