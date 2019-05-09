var Immutable = require('immutable');

var TemplateOutput = Immutable.Record({
    // Text content of the template
    content:        String(),

    // Map of blocks to replace / post process
    blocks:         Immutable.Map()
}, 'TemplateOutput');

TemplateOutput.prototype.getContent = function() {
    return this.get('content');
};

TemplateOutput.prototype.getBlocks = function() {
    return this.get('blocks');
};

/**
 * Update content of this output
 * @param {String} content
 * @return {TemplateContent}
 */
TemplateOutput.prototype.setContent = function(content) {
    return this.set('content', content);
};

/**
 * Create a TemplateOutput from a text content
 * and an object containing block definition
 * @param {String} content
 * @param {Object} blocks
 * @return {TemplateOutput}
 */
TemplateOutput.create = function(content, blocks) {
    return new TemplateOutput({
        content:    content,
        blocks:     Immutable.fromJS(blocks)
    });
};

module.exports = TemplateOutput;
