const is = require('is');
const extend = require('extend');
const { Record, List, Map } = require('immutable');
const escape = require('escape-html');

const Promise = require('../utils/promise');
const TemplateShortcut = require('./templateShortcut');

const NODE_ENDARGS = '%%endargs%%';
const HTML_TAGNAME = 'xblock';

const DEFAULTS = {
    // Name of block, also the start tag
    name:      String(),
    // End tag, default to "end<name>"
    end:       String(),
    // Function to process the block content
    process:   Function(),
    // List of String, for inner block tags
    blocks:    List(),
    // List of shortcuts to replace with this block
    shortcuts: Map()
};

class TemplateBlock extends Record(DEFAULTS) {
    getName() {
        return this.get('name');
    }

    getEndTag() {
        return this.get('end') || ('end' + this.getName());
    }

    getProcess() {
        return this.get('process');
    }

    getBlocks() {
        return this.get('blocks');
    }


    /**
     * Return shortcuts associated with this block or undefined
     * @return {TemplateShortcut|undefined}
     */
    getShortcuts() {
        const shortcuts = this.get('shortcuts');
        if (shortcuts.size === 0) {
            return undefined;
        }

        return TemplateShortcut.createForBlock(this, shortcuts);
    }

    /**
     * Return name for the nunjucks extension
     * @return {String}
     */
    getExtensionName() {
        return 'Block' + this.getName() + 'Extension';
    }

    /**
     * Return a nunjucks extension to represents this block
     * @return {Nunjucks.Extension}
     */
    toNunjucksExt(mainContext = {}) {
        const that = this;
        const name = this.getName();
        const endTag = this.getEndTag();
        const blocks = this.getBlocks().toJS();

        function Ext() {
            this.tags = [name];

            this.parse = (parser, nodes) => {
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

            this.run = (context, ...fnArgs) => {
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
                        children: blockBody(),
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
                    }, mainContext);

                    return that.toProps(mainBlock, ctx);
                })
                .then(function(props) {
                    return that.toHTML(props);
                })
                .nodeify(callback);
            };
        }

        return Ext;
    }

    /**
     * Apply a block an return the props
     *
     * @param {Object} inner
     * @param {Object} context
     * @return {Promise<Props>}
     */
    toProps(inner, context) {
        const processFn = this.getProcess();

        inner = inner || {};
        inner.args = inner.args || [];
        inner.kwargs = inner.kwargs || {};
        inner.blocks = inner.blocks || [];

        return Promise()
        .then(() => processFn.call(context, inner))
        .then(props => {
            if (is.string(props)) {
                return { children: props };
            }

            return props;
        });
    }

    /**
     * Convert a block props to HTML. This HTML is then being
     * parsed by gitbook-core during rendering, and binded to the right react components.
     *
     * @param {Object} props
     * @return {String}
     */
    toHTML(props) {
        const { children, ...innerProps } = props;
        const payload = escape(JSON.stringify(innerProps));

        return (
            `<${HTML_TAGNAME} name="${this.name}" props="${payload}">${children || ''}</${HTML_TAGNAME}>`
        );
    }

    /**
     * Create a template block from a function or an object
     * @param {String} blockName
     * @param {Object} block
     * @return {TemplateBlock}
     */
    static create(blockName, block) {
        if (is.fn(block)) {
            block = new Map({
                process: block
            });
        }

        block = new TemplateBlock(block);
        block = block.set('name', blockName);
        return block;
    }
}

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
