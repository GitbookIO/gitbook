var Q = require("q");
var _ = require("lodash");
var path = require("path");
var glob = require("glob");
var fs = require("./fs");
var parse = require("../parse");
var template = require("./template");

var generate = function(root, output, options) {
    var files, summary, tpl;

    options = _.defaults(options || {}, {
        // Book title
        title: null,

        // Origin github repository id
        github: null
    });

    if (!options.github) return Q.reject(new Error("Need options.github for specifing the github origin"));

    // List all files in the repository
    return Q.nfcall(glob, "**/*", {
        cwd: root,
        mark: true
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
        });
    })

    // Create template
    .then(function() {
        tpl = template({
            root: root,
            output: output,
            locals: {
                githubId: options.github,
                title: options.title,
                summary: summary
            }
        })
    })

    // Copy file and replace markdown file
    .then(function() {
        console.log(files, summary);
        return Q.all(
            _.chain(files)
            .map(function(file) {
                if (!file) return;

                // Folder
                if (file[file.length -1] == "/") {
                    return fs.mkdirp(
                        path.join(output, file)
                    );
                }

                // Markdown file
                else if (path.extname(file) == ".md") {
                    return tpl(file, file.replace(".md", ".html"));
                }

                // Copy file
                else {
                    return fs.copy(
                        path.join(root, file),
                        path.join(output, file)
                    );
                }
            })
            .value()
        )
    })

    // Copy assets
    .then(function() {
        return fs.copy(
            path.join(__dirname, "../../assets/static"),
            path.join(output, "gitbook")
        );
    })
};

module.exports = {
    folder: generate
}