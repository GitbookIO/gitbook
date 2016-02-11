var path = require('path');
var nunjucks = require('nunjucks');

var Git = require('../utils/git');
var pathUtil = require('../utils/path');

// The loader should handle relative and git url
var Loader = nunjucks.Loader.extend({
    async: true,

    init: function(engine, opts) {
        this.engine = engine;
        this.book = engine.book;
        this.fs = engine.book.fs;

        this.git = new Git(this.fs.tmpdir());
    },

    getSource: function(soureURL, callback) {
        var that = this;

        this.git.resolveFile(soureURL)
        .then(function(filepath) {
            // Is local file
            if (!filepath) {
                filepath = that.book.resolve(soureURL);
            } else {
                that.book.log.debug.ln('resolve from git', soureURL, 'to', filepath);
            }

            //  Read file from absolute path
            return that.fs.readAsString(filepath)
            .then(function(source) {
                return that.engine.interpolate(filepath, source);
            })
            .then(function(source) {
                return {
                    src: source,
                    path: filepath,

                    // We disable cache since content is modified (shortcuts, ...)
                    noCache: true
                };
            });
        })
        .nodeify(callback);
    },

    resolve: function(from, to) {
        // If origin is in the book, we enforce result file to be in the book
        if (this.book.isInBook(from)) {
            return this.book.resolve(
                this.book.relative(path.dirname(from)),
                to
            );
        }

        // If origin is in a git repository, we resolve file in the git repository
        var gitRoot = this.git.resolveRoot(from);
        if (gitRoot) {
            return pathUtil.resolveInRoot(gitRoot, to);
        }

        // If origin is not in the book (include from a git content ref)
        return path.resolve(path.dirname(from), to);
    },

    // Handle all files as relative, so that nunjucks pass responsability to 'resolve'
    // Only git urls are considered as absolute
    isRelative: function(filename) {
        return !Git.isUrl(filename);
    }
});

module.exports = Loader;
