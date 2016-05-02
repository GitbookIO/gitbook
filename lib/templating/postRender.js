var Promise = require('../utils/promise');
var replaceBlocks = require('./replaceBlocks');

/**
    Post render a template:
        - Execute "post" for blocks
        - Replace block content

    @param {TemplateEngine} engine
    @param {String} content
    @return {Promise<String>}
*/
function postRender(engine, content) {
    var result = replaceBlocks(content);

    return Promise.forEach(result.blocks, function(blockType) {
        var block = engine.getBlock(blockType);
        var post = block.getPost();
        if (!post) {
            return;
        }

        return post();
    })
    .thenResolve(result.content);
}

module.exports = postRender;
