var _ = require('lodash');
var kramed = require('kramed');
var textRenderer = require('kramed-text-renderer');

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
    nodes = kramed.lexer(src);

    title = extractFirstNode(nodes, "heading") || '';
    description = extractFirstNode(nodes, "paragraph") || '';

    var convert = _.compose(
        function(text) {
            return _.unescape(text.replace(/(\r\n|\n|\r)/gm, ""));
        },
        function(text) {
            return kramed.parse(text, _.extend({}, kramed.defaults, {
                renderer: renderer
            }));
        }
    );

    return {
        title: convert(title),
        description: convert(description)
    };
}


// Exports
module.exports = parseReadme;
