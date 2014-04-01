var Q = require("q");
var _ = require("lodash");
var path = require("path");
var glob = require("glob");
var fs = require("./fs");
var parse = require("../parse");
var template = require("./template");

var generate = function(root, output, options) {
    var files, summary, navigation, tpl;

    options = _.defaults(options || {}, {
        // Book title
        title: null,

        // Origin github repository id
        github: null
    });

    if (!options.github || !options.title) return Q.reject(new Error("Need options.github and optiosn.title"));


    // Clean output folder
    return fs.remove(output)

    // List all files in the repository
    .then(function() {
        return Q.nfcall(glob, "**/*", {
            cwd: root,
            mark: true
        });
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

    // Create template
    .then(function() {
        tpl = template({
            root: root,
            output: output,
            locals: {
                githubAuthor: options.github.split("/")[0],
                githubId: options.github,
                title: options.title,
                summary: summary,
                allNavigation: navigation
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