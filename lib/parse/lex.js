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
function sectionType(nodes, idx) {
    var codeNodes = _.filter(nodes, {
        type: 'code'
    }).length;

    if(codeNodes === 3 && (idx % 2) == 1) {
        return 'exercise';
    }

    return 'normal';
}

function lexPage(src) {
    // Lex file
    var nodes = marked.lexer(src);

    return _.chain(splitSections(nodes))
    .map(function(section, idx) {
        // Detect section type
        section.type = sectionType(section, idx);
        return section;
    })
    .filter(function(section) {
        return !_.isEmpty(section);
    })
    .reduce(function(sections, section) {
        var last = _.last(sections);

        // Merge normal sections together
        if(last && last.type === section.type && last.type === 'normal') {
            last.push.apply(last, [{'type': 'hr'}].concat(section));
        } else {
            // Add to list of sections
            sections.push(section);
        }

        return sections;
    }, [])
    .value();
}

// Exports
module.exports = lexPage;
