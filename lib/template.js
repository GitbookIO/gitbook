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
    } catch(e) {}

    this.log.debug.ln("add filter '"+filterName+"'");
    this.env.addFilter(filterName, func, true);
    return true;
};

// Add a block
TemplateEngine.prototype.addBlock = function(name, block) {
    var that = this;

    block = _.defaults(block || {}, {
        end: "end"+name,
        process: _.identity,
        blocks: []
    });

    var extName = 'Block'+name+'Extension';
    if (this.env.getExtension(extName)) {
        this.log.warn.ln("conflict in blocks, '"+extName+"' is already defined");
        return false;
    }

    this.log.debug.ln("add block '"+name+"'");

    var Ext = function () {
        this.tags = [name];

        this.parse = function(parser, nodes, lexer) {
            var body = null;
            var lastBlockName = null;
            var lastBlockArgs = null;
            var allBlocks = block.blocks.concat([block.end]);
            var subbodies = {};

            var tok = parser.nextToken();
            var args = parser.parseSignature(null, true);
            parser.advanceAfterBlockEnd(tok.value);

            while (1) {
                // Read body
                var currentBody = parser.parseUntilBlocks.apply(parser, allBlocks);

                // Handle body with previous block name and args
                if (lastBlockName) {
                    subbodies[lastBlockName] = subbodies[lastBlockName] || [];
                    subbodies[lastBlockName].push({
                        body: currentBody,
                        args: lastBlockArgs
                    });
                } else {
                    body = currentBody;
                }

                // Read new block
                lastBlockName = parser.peekToken().value;
                if (lastBlockName == block.end) {
                    break;
                }

                // Parse signature and move to the end of the block
                lastBlockArgs = parser.parseSignature(null, true);
                parser.advanceAfterBlockEnd(lastBlockName);
            }
            parser.advanceAfterBlockEnd();

            var bodies = [body];
            _.each(block.blocks, function(blockName) {
                subbodies[blockName] = subbodies[blockName] || [];
                if (subbodies[blockName].length == 0) {
                    subbodies[blockName].push({
                        args: new nodes.NodeList(),
                        body: new nodes.NodeList()
                    });
                }

                bodies.push(subbodies[blockName][0].body);
            });

            return new nodes.CallExtensionAsync(this, 'run', args, bodies);
        };

        this.run = function(context) {
            var args = Array.prototype.slice.call(arguments, 1);
            var callback = args.pop();

            // Extract blocks body
            var _blocks =  _.chain(block.blocks)
                .reverse()
                .map(function(blockName){
                    return {
                        name: blockName,
                        body: args.pop()()
                    };
                })
                .reverse()
                .value();

            var body = args.pop();
            var kwargs = args.pop() || {};

            Q()
            .then(function() {
                return block.process.call({
                    ctx: context.ctx,
                    book: that.book
                }, {
                    body: body(),
                    args: args,
                    kwargs: kwargs,
                    blocks: _blocks
                });
            })
            .nodeify(callback)
        };
    };


    // Add the Extension
    this.env.addExtension(extName, new Ext());
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
