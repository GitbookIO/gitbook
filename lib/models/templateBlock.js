var is = require('is');
var extend = require('extend');
var Immutable = require('immutable');

var Promise = require('../utils/promise');
var genKey = require('../utils/genKey');
var TemplateShortcut = require('./templateShortcut');

var NODE_ENDARGS = '%%endargs%%';

var TemplateBlock = Immutable.Record({
    // Name of block, also the start tag
    name:           String(),

    // End tag, default to "end<name>"
    end:            String(),

    // Function to process the block content
    process:        Function(),

    // List of String, for inner block tags
    blocks:         Immutable.List(),

    // List of shortcuts to replace with this block
    shortcuts:      Immutable.Map()
}, 'TemplateBlock');

TemplateBlock.prototype.getName = function() {
    return this.get('name');
};

TemplateBlock.prototype.getEndTag = function() {
    return this.get('end') || ('end' + this.getName());
};

TemplateBlock.prototype.getProcess = function() {
    return this.get('process');
};

TemplateBlock.prototype.getBlocks = function() {
    return this.get('blocks');
};


/**
 * Return shortcuts associated with this block or undefined
 * @return {TemplateShortcut|undefined}
 */
TemplateBlock.prototype.getShortcuts = function() {
    var shortcuts = this.get('shortcuts');
    if (shortcuts.size === 0) {
        return undefined;
    }

    return TemplateShortcut.createForBlock(this, shortcuts);
};

/**
 * Return name for the nunjucks extension
 * @return {String}
 */
TemplateBlock.prototype.getExtensionName = function() {
    return 'Block' + this.getName() + 'Extension';
};

/**
 * Return a nunjucks extension to represents this block
 * @return {Nunjucks.Extension}
 */
TemplateBlock.prototype.toNunjucksExt = function(mainContext, blocksOutput) {
    blocksOutput = blocksOutput || {};

    var that = this;
    var name = this.getName();
    var endTag = this.getEndTag();
    var blocks = this.getBlocks().toJS();

    function Ext() {
        this.tags = [name];

        this.parse = function(parser, nodes) {
            var lastBlockName = null;
            var lastBlockArgs = null;
            var allBlocks = blocks.concat([endTag]);

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
                lastBlockArgs.children.forEach(function(child) {
                    args.addChild(child);
                });

                // Read new block
                lastBlockName = parser.nextToken().value;

                // Parse signature and move to the end of the block
                if (lastBlockName != endTag) {
                    lastBlockArgs = parser.parseSignature(null, true);
                }

                parser.advanceAfterBlockEnd(lastBlockName);
            } while (lastBlockName != endTag);

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
            blockNames.forEach(function(name, i) {
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
                var ctx = extend({
                    ctx: context
                }, mainContext || {});

                return that.applyBlock(mainBlock, ctx);
            })
            .then(function(result) {
                return that.blockResultToHtml(result, blocksOutput);
            })
            .nodeify(callback);
        };
    }

    return Ext;
};

/**
 * Apply a block to a content
 * @param {Object} inner
 * @param {Object} context
 * @return {Promise<String>|String}
 */
TemplateBlock.prototype.applyBlock = function(inner, context) {
    var processFn = this.getProcess();

    inner = inner || {};
    inner.args = inner.args || [];
    inner.kwargs = inner.kwargs || {};
    inner.blocks = inner.blocks || [];

    var r = processFn.call(context, inner);

    if (Promise.isPromiseAlike(r)) {
        return r.then(this.normalizeBlockResult.bind(this));
    } else {
        return this.normalizeBlockResult(r);
    }
};

/**
 * Normalize result from a block process function
 * @param {Object|String} result
 * @return {Object}
 */
TemplateBlock.prototype.normalizeBlockResult = function(result) {
    if (is.string(result)) {
        result = { body: result };
    }
    result.name = this.getName();

    return result;
};

/**
 * Convert a block result to HTML
 * @param {Object} result
 * @param {Object} blocksOutput: stored post processing blocks in this object
 * @return {String}
 */
TemplateBlock.prototype.blockResultToHtml = function(result, blocksOutput) {
    var indexedKey;
    var toIndex = (!result.parse) || (result.post !== undefined);

    if (toIndex) {
        indexedKey = genKey();
        blocksOutput[indexedKey] = result;
    }

    // Parsable block, just return it
    if (result.parse) {
        return result.body;
    }

    // Return it as a position marker
    return '{{-%' + indexedKey + '%-}}';

};

/**
 * Create a template block from a function or an object
 * @param {String} blockName
 * @param {Object} block
 * @return {TemplateBlock}
 */
TemplateBlock.create = function(blockName, block) {
    if (is.fn(block)) {
        block = new Immutable.Map({
            process: block
        });
    }

    block = new TemplateBlock(block);
    block = block.set('name', blockName);
    return block;
};

/**
 * Extract kwargs from an arguments array
 * @param {Array} args
 * @return {Object}
 */
function extractKwargs(args) {
    var last = args[args.length - 1];
    return (is.object(last) && last.__keywords)? args.pop() : {};
}

module.exports = TemplateBlock;
