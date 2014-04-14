var _ = require('lodash');
var marked = require('marked');

function extractFirstNode(nodes, nType) {
    return _.chain(nodes)
    .filter(function(node) {
        return node.type == nType;
    })
    .pluck("text")
    .first()
    .value();
}


function parseReadme(src) {
    var nodes, title, description;

    // Parse content
    nodes = marked.lexer(src);
    
    var title = extractFirstNode(nodes, "heading");
    var description = extractFirstNode(nodes, "paragraph");

    return {
        title: title,
        description: description
    };
}


// Exports
module.exports = parseReadme;
