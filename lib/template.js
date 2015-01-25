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
    }
});


var TemplateEngine = function(book) {
	this.book = book;

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

// Render a file from the book
TemplateEngine.prototype.renderFile = function(filename) {
	var that = this;

	return that.book.statFile(filename)
	.then(function(stat) {
		var context = {
			// Variables from book.json
			book: that.book.options.variables,

			// infos about the file
			file: {
				path: filename,
				mtime: stat.mtime
			},

			// infos about gitbook
			gitbook: {
                version: pkg.version
            }
		};

		return Q.nfcall(that.env.render.bind(that.env), filename, context);
	});
};

module.exports = TemplateEngine;
