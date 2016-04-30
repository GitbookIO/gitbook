var path = require('path');
var nunjucks = require('nunjucks');

var fs = require('../utils/fs');
var Git = require('../utils/git');
var LocationUtils = require('../utils/location');
var PathUtils = require('../utils/path');


/**
    Template loader resolving both:
        - relative url ("./test.md")
        - absolute url ("/test.md")
        - git url ("")
*/
var ConrefsLoader = nunjucks.Loader.extend({
    async: true,

    init: function(rootFolder, logger) {
        this.rootFolder = rootFolder;
        this.logger = logger;
        this.git = new Git();
    },

    getSource: function(sourceURL, callback) {
        var that = this;

        this.git.resolve(sourceURL)
        .then(function(filepath) {
            // Is local file
            if (!filepath) {
                filepath = path.resolve(sourceURL);
            } else {
                if (that.logger) that.logger.debug.ln('resolve from git', sourceURL, 'to', filepath);
            }

            //  Read file from absolute path
            return fs.readFile(filepath)
            .then(function(source) {
                return {
                    src: source.toString('utf8'),
                    path: filepath
                };
            });
        })
        .nodeify(callback);
    },

    resolve: function(from, to) {
        // If origin is in the book, we enforce result file to be in the book
        if (PathUtils.isInRoot(this.rootFolder, from)) {
            var href = LocationUtils.toAbsolute(to, path.dirname(from), '');
            return PathUtils.resolveInRoot(this.rootFolder, href);
        }

        // If origin is in a git repository, we resolve file in the git repository
        var gitRoot = this.git.resolveRoot(from);
        if (gitRoot) {
            return PathUtils.resolveInRoot(gitRoot, to);
        }

        // If origin is not in the book (include from a git content ref)
        return path.resolve(path.dirname(from), to);
    },

    // Handle all files as relative, so that nunjucks pass responsability to 'resolve'
    isRelative: function(filename) {
        return LocationUtils.isRelative(filename);
    }
});

module.exports = ConrefsLoader;
