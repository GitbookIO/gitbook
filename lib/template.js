var _ = require('lodash');
var Q = require('q');
var path = require('path');
var nunjucks = require('nunjucks');
var parsers = require('gitbook-parsers');
var escapeStringRegexp = require('escape-string-regexp');

var batch = require('./utils/batch');
var pkg = require('../package.json');
var defaultBlocks = require('./blocks');
var BookLoader = require('./conrefs_loader');

// Normalize result from a block
function normBlockResult(blk) {
    if (_.isString(blk)) blk = { body: blk };
    return blk;
}


var TemplateEngine = function(book) {
    var that = this;

    this.book = book;
    this.log = this.book.log;

    // Template loader
    this.loader = new BookLoader(book, {
        // Replace shortcuts in imported files
        interpolate: function(filepath, source) {
            var parser = parsers.get(path.extname(filepath));
            var type = parser? parser.name : null;

            return  that.applyShortcuts(type, source);
        }
    });

    // Nunjucks env
    this.env = new nunjucks.Environment(
        this.loader,
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

    // Map of blocks bodies (that requires post-processing)
    this.blockBodies = {};

    // Map of added blocks
    this.blocks = {};

    // Bind methods
    _.bindAll(this);

    // Add default blocks
    this.addBlocks(defaultBlocks);
};

// Process the result of block in a context
TemplateEngine.prototype.processBlock = function(blk) {
    blk = _.defaults(blk, {
        parse: false,
        post: undefined
    });
    blk.id = _.uniqueId('blk');

    var toAdd = (!blk.parse) || (blk.post !== undefined);

    // Add to global map
    if (toAdd) this.blockBodies[blk.id] = blk;

    // Parsable block, just return it
    if (blk.parse) {
        return blk.body;
    }

    // Return it as a position marker
    return '@%@'+blk.id+'@%@';
};

// Replace position markers of blocks by body after processing
// This is done to avoid that markdown/asciidoc processer parse the block content
TemplateEngine.prototype.replaceBlocks = function(content) {
    var that = this;

    return content.replace(/\@\%\@([\s\S]+?)\@\%\@/g, function(match, key) {
        var blk = that.blockBodies[key];
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
        this.log.warn.ln('conflict in filters, \''+filterName+'\' is already set');
        return false;
    } catch(e) {
        // Filter doesn't exist
    }

    this.log.debug.ln('add filter \''+filterName+'\'');
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

// Add multiple filters
TemplateEngine.prototype.addFilters = function(filters) {
    _.each(filters, function(filter, name) {
        this.addFilter(name, filter);
    }, this);
};

// Return nunjucks extension name of a block
TemplateEngine.prototype.blockExtName = function(name) {
    return 'Block'+name+'Extension';
};

// Test if a block is defined
TemplateEngine.prototype.hasBlock = function(name) {
    return this.env.hasExtension(this.blockExtName(name));
};

// Remove a block
TemplateEngine.prototype.removeBlock = function(name) {
    if (!this.hasBlock(name)) return;

    // Remove nunjucks extension
    this.env.removeExtension(this.blockExtName(name));

    // Cleanup shortcuts
    this.shortcuts = _.reject(this.shortcuts, {
        block: name
    });
};

// Add a block
TemplateEngine.prototype.addBlock = function(name, block) {
    var that = this, Ext, extName;

    if (_.isFunction(block)) block = { process: block };

    block = _.defaults(block || {}, {
        shortcuts: [],
        end: 'end'+name,
        process: _.identity,
        blocks: []
    });

    extName = this.blockExtName(name);

    if (this.hasBlock(name) && !defaultBlocks[name]) {
        this.log.warn.ln('conflict in blocks, \''+name+'\' is already defined');
    }

    // Cleanup previous block
    this.removeBlock(name);

    this.log.debug.ln('add block \''+name+'\'');
    this.blocks[name] = block;

    Ext = function () {
        this.tags = [name];

        this.parse = function(parser, nodes) {
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
                if (subbodies[blockName].length === 0) {
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
            var kwargs = _.isObject(_.last(args))? args.pop() : {};

            // Extract blocks body
            var _blocks =  _.map(block.blocks, function(blockName, i){
                return {
                    name: blockName,
                    body: blocks[i]()
                };
            });

            Q()
            .then(function() {
                return that.applyBlock(name, {
                    body: body(),
                    args: args,
                    kwargs: kwargs,
                    blocks: _blocks
                }, context);
            })

            // process the block returned
            .then(that.processBlock)
            .nodeify(callback);
        };
    };

    // Add the Extension
    this.env.addExtension(extName, new Ext());

    // Add shortcuts
    if (!_.isArray(block.shortcuts)) block.shortcuts = [block.shortcuts];
    _.each(block.shortcuts, function(shortcut) {
        this.log.debug.ln('add template shortcut from \''+shortcut.start+'\' to block \''+name+'\' for parsers ', shortcut.parsers);
        this.shortcuts.push({
            block: name,
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

// Add multiple blocks
TemplateEngine.prototype.addBlocks = function(blocks) {
    _.each(blocks, function(block, name) {
        this.addBlock(name, block);
    }, this);
};

// Apply a block to some content
// This method result depends on the type of block (async or sync)
TemplateEngine.prototype.applyBlock = function(name, blk, ctx) {
    var func, block, r;

    block = this.blocks[name];
    if (!block) throw new Error('Block not found \''+name+'\'');
    if (_.isString(blk)) {
        blk = {
            body: blk
        };
    }

    blk = _.defaults(blk, {
        args: [],
        kwargs: {},
        blocks: []
    });

    // Bind and call block processor
    func = this.bindContext(block.process);
    r = func.call(ctx || {}, blk);

    if (Q.isPromise(r)) return r.then(normBlockResult);
    else return normBlockResult(r);
};

// Apply a shortcut to a string
TemplateEngine.prototype._applyShortcut = function(parser, content, shortcut) {
    if (!_.contains(shortcut.parsers, parser)) return content;
    var regex = new RegExp(
        escapeStringRegexp(shortcut.start) + '([\\s\\S]*?[^\\$])' + escapeStringRegexp(shortcut.end),
       'g'
    );
    return content.replace(regex, function(all, match) {
        return '{% '+shortcut.tag.start+' %}'+ match + '{% '+shortcut.tag.end+' %}';
    });
};

// Apply all shortcuts to some template string
TemplateEngine.prototype.applyShortcuts = function(type, content) {
    return _.reduce(this.shortcuts, _.partial(this._applyShortcut.bind(this), type), content);
};

// Render a string from the book
TemplateEngine.prototype.renderString = function(content, context, options) {
    context = _.extend({}, context, {
        // Variables from book.json
        book: this.book.options.variables,

        // Complete book.json
        config: this.book.options,

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
    if (!options.type && options.path) {
        var parser = parsers.get(path.extname(options.path));
        options.type = parser? parser.name : null;
    }

    // Replace shortcuts
    content = this.applyShortcuts(options.type, content);

    return Q.nfcall(this.env.renderString.bind(this.env), content, context, options)
    .fail(function(err) {
        if (_.isString(err)) err = new Error(err);
        err.message = err.message.replace(/^Error: /, '');

        throw err;
    });
};

// Render a file from the book
TemplateEngine.prototype.renderFile = function(filename) {
    var that = this;

    return that.book.readFile(filename)
    .then(function(content) {
        return that.renderString(content, {}, {
            path: filename
        });
    });
};

// Render a page from the book
TemplateEngine.prototype.renderPage = function(page) {
    var that = this;

    return that.book.statFile(page.path)
    .then(function(stat) {
        var context = {
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
        return batch.execEach(that.blockBodies, {
            max: 20,
            fn: function(blk, blkId) {
                return Q()
                .then(function() {
                    if (!blk.post) return Q();
                    return blk.post();
                })
                .then(function() {
                    delete that.blockBodies[blkId];
                });
            }
        })
        .thenResolve(_content);
    });
};

module.exports = TemplateEngine;
