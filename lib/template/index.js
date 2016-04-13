var _ = require('lodash');
var path = require('path');
var nunjucks = require('nunjucks');
var escapeStringRegexp = require('escape-string-regexp');

var Promise = require('../utils/promise');
var error = require('../utils/error');
var parsers = require('../parsers');
var defaultBlocks = require('./blocks');
var defaultFilters = require('./filters');
var Loader = require('./loader');

var NODE_ENDARGS = '%%endargs%%';

// Return extension name for a specific block
function blockExtName(name) {
    return 'Block'+name+'Extension';
}

// Normalize the result of block process function
function normBlockResult(blk) {
    if (_.isString(blk)) blk = { body: blk };
    return blk;
}

// Extract kwargs from an arguments array
function extractKwargs(args) {
    var last = _.last(args)
    return (_.isObject(last) && last.__keywords)? args.pop() : {};
}

function TemplateEngine(output) {
    this.output = output;
    this.book = output.book;
    this.log = this.book.log;

    // Create file loader
    this.loader = new Loader(this);

    // Create nunjucks instance
    this.env = new nunjucks.Environment(
        this.loader,
        {
            // Escaping is done after by the asciidoc/markdown parser
            autoescape: false,

            // Syntax
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

    // Add default blocks and filters
    this.addBlocks(defaultBlocks);
    this.addFilters(defaultFilters);

    // Build context for this book with depreacted fields
    this.ctx = {
        book: this.book,
        output: this.output
    };
    error.deprecateField(this.ctx, 'generator', this.output.name, '"generator" property is deprecated, use "output.generator" instead');
}

// Bind a function to a context
// Filters and blocks are binded to this context
TemplateEngine.prototype.bindContext = function(func) {
    var that = this;

    return function() {
        var ctx = _.extend({
            ctx: this.ctx
        }, that.ctx);

        return func.apply(ctx, arguments);
    };
};

// Interpolate a string content to replace shortcuts according to the filetype
TemplateEngine.prototype.interpolate = function(filepath, source) {
    var parser = parsers.getByExt(path.extname(filepath));
    var type = parser? parser.name : null;

    return this.applyShortcuts(type, source);
};

// Add a new custom filter
TemplateEngine.prototype.addFilter = function(filterName, func) {
    try {
        this.env.getFilter(filterName);
        this.log.error.ln('conflict in filters, "'+filterName+'" is already set');
        return false;
    } catch(e) {
        // Filter doesn't exist
    }

    this.log.debug.ln('add filter "'+filterName+'"');
    this.env.addFilter(filterName, this.bindContext(function() {
        var ctx = this;
        var args = Array.prototype.slice.apply(arguments);
        var callback = _.last(args);

        Promise()
        .then(function() {
            return func.apply(ctx, args.slice(0, -1));
        })
        .nodeify(callback);
    }), true);
    return true;
};

// Add multiple filters at once
TemplateEngine.prototype.addFilters = function(filters) {
    _.each(filters, function(filter, name) {
        this.addFilter(name, filter);
    }, this);
};

// Return true if a block is defined
TemplateEngine.prototype.hasBlock = function(name) {
    return this.env.hasExtension(blockExtName(name));
};

// Remove/Disable a block
TemplateEngine.prototype.removeBlock = function(name) {
    if (!this.hasBlock(name)) return;

    // Remove nunjucks extension
    this.env.removeExtension(blockExtName(name));

    // Cleanup shortcuts
    this.shortcuts = _.reject(this.shortcuts, {
        block: name
    });
};

// Add a block
// Using the extensions of nunjucks: https://mozilla.github.io/nunjucks/api.html#addextension
TemplateEngine.prototype.addBlock = function(name, block) {
    var that = this, Ext, extName;

    // Block can be a simple function
    if (_.isFunction(block)) block = { process: block };

    block = _.defaults(block || {}, {
        shortcuts: [],
        end: 'end'+name,
        blocks: []
    });

    extName = blockExtName(name);

    if (!block.process) {
        throw new Error('Invalid block "' + name + '", it should have a "process" method');
    }

    if (this.hasBlock(name) && !defaultBlocks[name]) {
        this.log.warn.ln('conflict in blocks, "'+name+'" is already defined');
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

            // Parse first block
            var tok = parser.nextToken();
            lastBlockArgs = parser.parseSignature(null, true);
            parser.advanceAfterBlockEnd(tok.value);

            var args = new nodes.NodeList();
            var bodies = [];
            var blockNamesNode = new nodes.Array(tok.lineno, tok.colno);
            var blockArgCounts = new nodes.Array(tok.lineno, tok.colno);

            // Parse while we found "end<block>"
            do {
                // Read body
                var currentBody = parser.parseUntilBlocks.apply(parser, allBlocks);

                // Handle body with previous block name and args
                blockNamesNode.addChild(new nodes.Literal(args.lineno, args.colno, lastBlockName));
                blockArgCounts.addChild(new nodes.Literal(args.lineno, args.colno, lastBlockArgs.children.length));
                bodies.push(currentBody);

                // Append arguments of this block as arguments of the run function
                _.each(lastBlockArgs.children, function(child) {
                    args.addChild(child);
                });

                // Read new block
                lastBlockName = parser.nextToken().value;

                // Parse signature and move to the end of the block
                if (lastBlockName != block.end) {
                    lastBlockArgs = parser.parseSignature(null, true);
                }

                parser.advanceAfterBlockEnd(lastBlockName);
            } while (lastBlockName != block.end);

            args.addChild(blockNamesNode);
            args.addChild(blockArgCounts);
            args.addChild(new nodes.Literal(args.lineno, args.colno, NODE_ENDARGS));

            return new nodes.CallExtensionAsync(this, 'run', args, bodies);
        };

        this.run = function(context) {
            var fnArgs = Array.prototype.slice.call(arguments, 1);

            var args;
            var blocks = [];
            var bodies = [];
            var blockNames;
            var blockArgCounts;
            var callback;

            // Extract callback
            callback = fnArgs.pop();

            // Detect end of arguments
            var endArgIndex = fnArgs.indexOf(NODE_ENDARGS);

            // Extract arguments and bodies
            args = fnArgs.slice(0, endArgIndex);
            bodies = fnArgs.slice(endArgIndex + 1);

            // Extract block counts
            blockArgCounts = args.pop();
            blockNames = args.pop();

            // Recreate list of blocks
            _.each(blockNames, function(name, i) {
                var countArgs = blockArgCounts[i];
                var blockBody = bodies.shift();

                var blockArgs = countArgs > 0? args.slice(0, countArgs) : [];
                args = args.slice(countArgs);
                var blockKwargs = extractKwargs(blockArgs);

                blocks.push({
                    name: name,
                    body: blockBody(),
                    args: blockArgs,
                    kwargs: blockKwargs
                });
            });

            var mainBlock = blocks.shift();
            mainBlock.blocks = blocks;

            Promise()
            .then(function() {
                return that.applyBlock(name, mainBlock, context);
            })

            // Process the block returned
            .then(that.processBlock)
            .nodeify(callback);
        };
    };

    // Add the Extension
    this.env.addExtension(extName, new Ext());

    // Add shortcuts if any
    if (!_.isArray(block.shortcuts)) {
        block.shortcuts = [block.shortcuts];
    }

    _.each(block.shortcuts, function(shortcut) {
        this.log.debug.ln('add template shortcut from "'+shortcut.start+'" to block "'+name+'" for parsers ', shortcut.parsers);
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

// Add multiple blocks at once
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
    if (!block) throw new Error('Block not found "'+name+'"');
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

    if (Promise.isPromise(r)) return r.then(normBlockResult);
    else return normBlockResult(r);
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
    return '{{-%'+blk.id+'%-}}';
};

// Render a string (without post processing)
TemplateEngine.prototype.render = function(content, context, options) {
    options = _.defaults(options || {}, {
        path: null
    });
    var filename = options.path;

    // Setup path and type
    if (options.path) {
        options.path = this.book.resolve(options.path);
    }

    // Replace shortcuts
    content = this.applyShortcuts(options.type, content);

    return Promise.nfcall(this.env.renderString.bind(this.env), content, context, options)
    .fail(function(err) {
        throw error.TemplateError(err, {
            filename: filename || '<inline>'
        });
    });
};

// Render a string with post-processing
TemplateEngine.prototype.renderString = function(content, context, options) {
    return this.render(content, context, options)
    .then(this.postProcess);
};

// Apply a shortcut to a string
TemplateEngine.prototype.applyShortcut = function(content, shortcut) {
    var regex = new RegExp(
        escapeStringRegexp(shortcut.start) + '([\\s\\S]*?[^\\$])' + escapeStringRegexp(shortcut.end),
       'g'
    );
    return content.replace(regex, function(all, match) {
        return '{% '+shortcut.tag.start+' %}'+ match + '{% '+shortcut.tag.end+' %}';
    });
};

// Replace position markers of blocks by body after processing
// This is done to avoid that markdown/asciidoc processer parse the block content
TemplateEngine.prototype.replaceBlocks = function(content) {
    var that = this;

    return content.replace(/\{\{\-\%([\s\S]+?)\%\-\}\}/g, function(match, key) {
        var blk = that.blockBodies[key];
        if (!blk) return match;

        var body = blk.body;

        return body;
    });
};

// Apply all shortcuts to a template
TemplateEngine.prototype.applyShortcuts = function(type, content) {
    return _.chain(this.shortcuts)
        .filter(function(shortcut) {
            return _.contains(shortcut.parsers, type);
        })
        .reduce(this.applyShortcut, content)
        .value();
};


// Post process content
TemplateEngine.prototype.postProcess = function(content) {
    var that = this;

    return Promise(content)
    .then(that.replaceBlocks)
    .then(function(_content) {
        return Promise.serie(that.blockBodies, function(blk, blkId) {
            return Promise()
            .then(function() {
                if (!blk.post) return;
                return blk.post();
            })
            .then(function() {
                delete that.blockBodies[blkId];
            });
        })
        .thenResolve(_content);
    });
};

module.exports = TemplateEngine;
