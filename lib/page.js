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

// What is the type of this section
function sectionType(nodes) {
    if(_.filter(nodes, {
        type: 'code'
    }).length === 3) {
        return 'exercise';
    }

    return 'normal';
}

function parsePage(src) {
    var nodes = marked.lexer(src);

    return _.chain(splitSections(nodes))
    .map(function(section) {
        section.type = sectionType(section);
        return section;
    })
    .value();
}

// Exports
module.exports = parsePage;
