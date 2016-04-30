var Immutable = require('immutable');
var TemplateBlock = require('../models/templateBlock');

/**
    Replace position markers of blocks by body after processing
    This is done to avoid that markdown/asciidoc processer parse the block content

    @param {String} content
    @return {Object} {blocks: Set, content: String}
*/
function replaceBlocks(content) {
    var blockTypes = new Immutable.Set();
    var newContent = content.replace(/\{\{\-\%([\s\S]+?)\%\-\}\}/g, function(match, key) {
        var replacedWith = match;

        var block = TemplateBlock.getBlockResultByKey(key);
        if (block) {
            var result = replaceBlocks(block.body);

            blockTypes = blockTypes.add(block.name);
            blockTypes = blockTypes.concat(result.blocks);
            replacedWith = result.content;
        }

        return replacedWith;
    });

    return {
        content: newContent,
        blocks: blockTypes
    };
}

module.exports = replaceBlocks;
