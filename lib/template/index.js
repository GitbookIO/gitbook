var _ = require('lodash');
var path = require('path');
var nunjucks = require('nunjucks');
var parsers = require('gitbook-parsers');
var escapeStringRegexp = require('escape-string-regexp');

var Promise = require('../utils/promise');
var error = require('../utils/error');
var gitbook = require('../gitbook');
var defaultBlocks = require('./blocks');
var Loader = require('./loader');

// Return extension name for a specific block
function blockExtName(name) {
    return 'Block'+name+'Extension';
}

// Normalize the result of block process function
function normBlockResult(blk) {
    if (_.isString(blk)) blk = { body: blk };
    return blk;
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

    // Add default blocks
    this.addBlocks(defaultBlocks);
}

// Interpolate a string content to replace shortcuts according to the filetype
TemplateEngine.prototype.interpolate = function(filepath, source) {
    var parser = parsers.get(path.extname(filepath));
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
        process: _.identity,
        blocks: []
    });

    extName = blockExtName(name);

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

            Promise()
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


// Render a string
TemplateEngine.prototype.renderString = function(content, context, options) {
    options = _.defaults(options || {}, {
        path: null
    });

    // Setup context for the template
    context = _.extend({}, context, {
        // Variables from book.json
        book: this.book.config.get('variables'),

        // Complete book.json
        config: this.book.config.dump(),

        // infos about gitbook
        gitbook: {
            version: gitbook.version,
            generator: this.book.config.get('generator')
        }
    });

    // Setup path and type
    if (options.path) {
        options.path = this.book.resolve(options.path);
    }
    if (!context.type && options.path) {
        var parser = parsers.get(path.extname(options.path));
        context.type = parser? parser.name : null;
    }

    // Replace shortcuts
    content = this.applyShortcuts(options.type, content);

    return Promise.nfcall(this.env.renderString.bind(this.env), content, context, options)
    .fail(function(err) {
        throw error.TemplateError(err, {
            filename: options.path
        });
    });
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

// Apply all shortcuts to a template
TemplateEngine.prototype.applyShortcuts = function(type, content) {
    return _.chain(this.shortcuts)
        .filter(function(shortcut) {
            return _.contains(shortcut.parsers, type);
        })
        .reduce(this.applyShortcut, content)
        .value();
};


module.exports = TemplateEngine;
