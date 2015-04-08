var _ = require("lodash");
var Q = require("q");
var path = require("path");
var nunjucks = require("nunjucks");
var escapeStringRegexp = require("escape-string-regexp");

var git = require("./utils/git");
var fs = require("./utils/fs");
var batch = require("./utils/batch");
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

    // List of tags shortcuts
    this.shortcuts = [];

    // Map of blocks
    this.blocks = {};

    // Bind methods
    _.bindAll(this);

    // Default block "html" that return html not parsed
    this.addBlock("html", {
        process: _.identity
    });
};

// Process a block in a context
TemplateEngine.prototype.processBlock = function(blk) {
    if (_.isString(blk)) blk = { body: blk };

    blk = _.defaults(blk, {
        parse: false,
        post: undefined
    });
    blk.id = _.uniqueId("blk");

    var toAdd = (!blk.parse) || (blk.post != undefined);

    // Add to global map
    if (toAdd) this.blocks[blk.id] = blk;

    //Parsable block, just return it
    if (blk.parse) {
        return blk.body;
    }

    // Return it as a macro
    return "%+%"+blk.id+"%+%";
};

// Replace blocks by body after processing
// This is done to avoid that markdown processer parse the block content
TemplateEngine.prototype.replaceBlocks = function(content) {
    var that = this;

    return content.replace(/\%\+\%([\s\S]+?)\%\+\%/g, function(match, key) {
        var blk = that.blocks[key];
        if (!blk) return match;

        var body = blk.body;

        return body;
    });
};

// Bind a function to a context
TemplateEngine.prototype.bindContext = function(func) {
    var that = this;

    return function() {
        var ctx = {
            ctx: this.ctx,
            book: that.book,
            generator: that.book.options.generator
        };

        return func.apply(ctx, arguments);
    };
};

// Add filter
TemplateEngine.prototype.addFilter = function(filterName, func) {
    try {
        this.env.getFilter(filterName);
        this.log.warn.ln("conflict in filters, '"+filterName+"' is already set");
        return false;
    } catch(e) {}

    this.log.debug.ln("add filter '"+filterName+"'");
    this.env.addFilter(filterName, this.bindContext(function() {
        var ctx = this;
        var args = Array.prototype.slice.apply(arguments);
        var callback = _.last(args);

        Q()
        .then(function() {
            return func.apply(ctx, args.slice(0, -1));
        })
        .nodeify(callback);
    }), true);
    return true;
};

// Add a block
TemplateEngine.prototype.addBlock = function(name, block) {
    var that = this;

    block = _.defaults(block || {}, {
        shortcuts: [],
        end: "end"+name,
        process: _.identity,
        blocks: []
    });

    var extName = 'Block'+name+'Extension';
    if (this.env.getExtension(extName)) {
        this.log.warn.ln("conflict in blocks, '"+name+"' is already defined");
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

            // Extract blocks
            var blocks = args
                .concat([])
                .slice(-block.blocks.length);

            // Eliminate blocks from list
            if (block.blocks.length > 0) args = args.slice(0, -block.blocks.length);

            // Extract main body and kwargs
            var body = args.pop();
            var kwargs = args.pop() || {};

            // Extract blocks body
            var _blocks =  _.map(block.blocks, function(blockName, i){
                return {
                    name: blockName,
                    body: blocks[i]()
                };
            });

            var func = that.bindContext(block.process);

            Q()
            .then(function() {
                return func.call(context, {
                    body: body(),
                    args: args,
                    kwargs: kwargs,
                    blocks: _blocks
                });
            })

            // process the block returned
            .then(that.processBlock)
            .nodeify(callback)
        };
    };


    // Add the Extension
    this.env.addExtension(extName, new Ext());

    // Add shortcuts
    if (!_.isArray(block.shortcuts)) block.shortcuts = [block.shortcuts];
    _.each(block.shortcuts, function(shortcut) {
        this.log.debug.ln("add template shortcut from '"+shortcut.start+"' to block '"+name+"' for parsers ", shortcut.parsers);
        this.shortcuts.push({
            parsers: shortcut.parsers,
            start: shortcut.start,
            end: shortcut.end,
            tag: {
                start: name,
                end: block.end
            }
        });
    }, this);
};

// Apply a shortcut to a string
TemplateEngine.prototype._applyShortcut = function(parser, content, shortcut) {
    if (!_.contains(shortcut.parsers, parser)) return content;
    var regex = new RegExp(
        escapeStringRegexp(shortcut.start) + "([\\s\\S]*?[^\\$])" + escapeStringRegexp(shortcut.end),
       'g'
    );
    return content.replace(regex, function(all, match) {
        return "{% "+shortcut.tag.start+" %}"+ match + "{% "+shortcut.tag.end+" %}";
    });
};

// Render a string from the book
TemplateEngine.prototype.renderString = function(content, context, options) {
    var context = _.extend({}, context, {
        // Variables from book.json
        book: this.book.options.variables,

        // infos about gitbook
        gitbook: {
            version: pkg.version,
            generator: this.book.options.generator
        }
    });
    options = _.defaults(options || {}, {
        path: null,
        type: null
    });
    if (options.path) options.path = this.book.resolve(options.path);

    // Replace shortcuts
    content = _.reduce(this.shortcuts, _.partial(this._applyShortcut.bind(this), options.type), content);

    return Q.nfcall(this.env.renderString.bind(this.env), content, context, options)
    .fail(function(err) {
        if (_.isString(err)) err = new Error(err);
        err.message = err.message.replace(/^Error: /, "");

        throw err;
    });
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
            path: page.path,
            type: page.type
        });
    });
};

// Post process content
TemplateEngine.prototype.postProcess = function(content) {
    var that = this;

    return Q(content)
    .then(that.replaceBlocks)
    .then(function(_content) {
        return batch.execEach(that.blocks, {
            max: 20,
            fn: function(blk, blkId) {
                return Q()
                .then(function() {
                    if (!blk.post) return Q();
                    return blk.post();
                })
                .then(function() {
                    delete that.blocks[blkId];
                });
            }
        })
        .thenResolve(_content);
    });
};

module.exports = TemplateEngine;
