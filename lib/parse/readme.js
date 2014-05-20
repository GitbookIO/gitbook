var _ = require('lodash');
var marked = require('marked');
var textRenderer = require('marked-text-renderer');

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
    var renderer = textRenderer();

    // Parse content
    nodes = marked.lexer(src);

    var title = extractFirstNode(nodes, "heading");
    var description = extractFirstNode(nodes, "paragraph");

    var convert = _.compose(
        function(text) {
            return _.unescape(text.replace(/(\r\n|\n|\r)/gm, ""));
        },
        _.partialRight(marked, _.extend({}, marked.defaults, {
            renderer: renderer
        }))
    );

    return {
        title: convert(title),
        description: convert(description)
    };
}


// Exports
module.exports = parseReadme;
