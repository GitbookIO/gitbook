var _ = require('lodash');
var marked = require('marked');


// Split a page up into sections (lesson, exercises, ...)
function splitSections(nodes) {
    var section = [];

    return _.reduce(nodes, function(sections, el) {
        if(el.type === 'hr') {
            sections.push(section);
            section = [];
        } else {
            section.push(el);
        }

        return sections;
    }, []).concat([section]); // Add remaining nodes
}

function parsePage(src) {
    var nodes = marked.lexer(src);

    return splitSections(nodes);
}

// Exports
module.exports = parsePage;
