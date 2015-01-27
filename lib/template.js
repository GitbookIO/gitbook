var _ = require("lodash");
var Q = require("q");
var path = require("path");
var nunjucks = require("nunjucks");

var git = require("./utils/git");
var fs = require("./utils/fs");
var pkg = require("../package.json");


// The loader should handle relative and git url
var BookLoader = nunjucks.Loader.extend({
	async: true,

    init: function(book) {
    	this.book = book;
    },

    getSource: function(fileurl, callback) {
    	var that = this;

		git.resolveFile(fileurl)
		.then(function(filepath) {
			// Is local file
			if (!filepath) filepath = path.resolve(that.book.root, fileurl);
			else that.book.log.debug.ln("resolve from git", fileurl, "to", filepath)

			//  Read file from absolute path
			return fs.readFile(filepath)
    		.then(function(source) {
    			return {
    				src: source.toString(),
    				path: filepath
    			}
    		});
		})
		.nodeify(callback);
    },

    resolve: function(from, to) {
        return path.resolve(path.dirname(from), to);
    }
});


var TemplateEngine = function(book) {
	this.book = book;
    this.log = this.book.log;

	// Nunjucks env
	this.env = new nunjucks.Environment(
		new BookLoader(book),
		{
			// Escaping is done after by the markdown parser
			autoescape: false,

			// Tags
			tags: {
				blockStart: '{%',
				blockEnd: '%}',
				variableStart: '{{',
				variableEnd: '}}',
				commentStart: '{###',
				commentEnd: '###}'
			}
		}
	);
};


// Add filter
TemplateEngine.prototype.addFilter = function(filterName, func) {
    try {
        this.env.getFilter(filterName);
        this.log.warn.ln("conflict in filters, '"+filterName+"' is already set");
        return false;
    } catch(e) {
        this.log.debug.ln("add filter '"+filterName+"'");
        this.env.addFilter(filterName, func, true);
        return true;
    }
};

// Render a string from the book
TemplateEngine.prototype.renderString = function(content, context, options) {
    var context = _.extend({}, context, {
        // Variables from book.json
        book: this.book.options.variables,

        // infos about gitbook
        gitbook: {
            version: pkg.version
        }
    });
    options = _.defaults(options || {}, { path: null});
    if (options.path) options.path = this.book.resolve(options.path);

    return Q.nfcall(this.env.renderString.bind(this.env), content, context, options);
};

// Render a file from the book
TemplateEngine.prototype.renderFile = function(filename, options) {
	var that = this, context;

    return that.book.readFile(filename)
    .then(function(content) {
        return that.renderString(content, {}, {
            path: filename
        });
    });
};

// Render a page from the book
TemplateEngine.prototype.renderPage = function(page) {
    var that = this, context;

    return that.book.statFile(page.path)
    .then(function(stat) {
       context = {
            // infos about the file
            file: {
                path: page.path,
                mtime: stat.mtime
            }
        };

        return that.renderString(page.content, context, {
            path: page.path
        });
    });
};

module.exports = TemplateEngine;
