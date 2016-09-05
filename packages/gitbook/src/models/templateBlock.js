const is = require('is');
const extend = require('extend');
const Immutable = require('immutable');

const Promise = require('../utils/promise');
const genKey = require('../utils/genKey');
const TemplateShortcut = require('./templateShortcut');

const NODE_ENDARGS = '%%endargs%%';

const TemplateBlock = Immutable.Record({
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
    const shortcuts = this.get('shortcuts');
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

    const that = this;
    const name = this.getName();
    const endTag = this.getEndTag();
    const blocks = this.getBlocks().toJS();

    function Ext() {
        this.tags = [name];

        this.parse = function(parser, nodes) {
            let lastBlockName = null;
            let lastBlockArgs = null;
            const allBlocks = blocks.concat([endTag]);

            // Parse first block
            const tok = parser.nextToken();
            lastBlockArgs = parser.parseSignature(null, true);
            parser.advanceAfterBlockEnd(tok.value);

            const args = new nodes.NodeList();
            const bodies = [];
            const blockNamesNode = new nodes.Array(tok.lineno, tok.colno);
            const blockArgCounts = new nodes.Array(tok.lineno, tok.colno);

            // Parse while we found "end<block>"
            do {
                // Read body
                const currentBody = parser.parseUntilBlocks(...allBlocks);

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

        this.run = function(context, ...fnArgs) {
            let args;
            const blocks = [];
            let bodies = [];

            // Extract callback
            const callback = fnArgs.pop();

            // Detect end of arguments
            const endArgIndex = fnArgs.indexOf(NODE_ENDARGS);

            // Extract arguments and bodies
            args = fnArgs.slice(0, endArgIndex);
            bodies = fnArgs.slice(endArgIndex + 1);

            // Extract block counts
            const blockArgCounts = args.pop();
            const blockNames = args.pop();

            // Recreate list of blocks
            blockNames.forEach((blkName, i) => {
                const countArgs = blockArgCounts[i];
                const blockBody = bodies.shift();

                const blockArgs = countArgs > 0 ? args.slice(0, countArgs) : [];
                args = args.slice(countArgs);
                const blockKwargs = extractKwargs(blockArgs);

                blocks.push({
                    name: blkName,
                    body: blockBody(),
                    args: blockArgs,
                    kwargs: blockKwargs
                });
            });

            const mainBlock = blocks.shift();
            mainBlock.blocks = blocks;

            Promise()
            .then(function() {
                const ctx = extend({
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
    const processFn = this.getProcess();

    inner = inner || {};
    inner.args = inner.args || [];
    inner.kwargs = inner.kwargs || {};
    inner.blocks = inner.blocks || [];

    const r = processFn.call(context, inner);

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
    let indexedKey;
    const toIndex = (!result.parse) || (result.post !== undefined);

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
    const last = args[args.length - 1];
    return (is.object(last) && last.__keywords) ? args.pop() : {};
}

module.exports = TemplateBlock;
