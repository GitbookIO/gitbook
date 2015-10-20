var _ = require('lodash');
var path = require('path');
var nunjucks = require('nunjucks');

var git = require('./utils/git');
var fs = require('./utils/fs');
var pathUtil = require('./utils/path');

// The loader should handle relative and git url
var BookLoader = nunjucks.Loader.extend({
    async: true,

    init: function(book, opts) {
        this.opts = _.defaults(opts || {}, {
            interpolate: _.identity
        });
        this.book = book;
    },

    getSource: function(fileurl, callback) {
        var that = this;

        git.resolveFile(fileurl)
        .then(function(filepath) {
            // Is local file
            if (!filepath) filepath = path.resolve(fileurl);
            else that.book.log.debug.ln('resolve from git', fileurl, 'to', filepath);

            //  Read file from absolute path
            return fs.readFile(filepath)
            .then(function(source) {
                return that.opts.interpolate(filepath, source.toString());
            })
            .then(function(source) {
                return {
                    src: source,
                    path: filepath,

                    // We disable cache sincde content is modified (shortcuts, ...)
                    noCache: true
                };
            });
        })
        .nodeify(callback);
    },

    resolve: function(from, to) {
        // If origin is in the book, we enforce result file to be in the book
        if (this.book.fileIsInBook(from)) {
            return this.book.resolve(
                this.book.relative(path.dirname(from)),
                to
            );
        }

        // If origin is in a git repository, we resolve file in the git repository
        var gitRoot = git.resolveRoot(from);
        if (gitRoot) {
            return pathUtil.resolveInRoot(gitRoot, to);
        }

        // If origin is not in the book (include from a git content ref)
        return path.resolve(path.dirname(from), to);
    },

    // Handle all files as relative, so that nunjucks pass responsability to 'resolve'
    // Only git urls are considered as absolute
    isRelative: function(filename) {
        return !git.checkUrl(filename);
    }
});

module.exports = BookLoader;
