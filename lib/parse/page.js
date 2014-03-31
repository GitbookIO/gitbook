var _ = require('lodash');
var marked = require('marked');

var renderer = require('./renderer');


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

function parsePage(src) {
    var nodes = marked.lexer(src);

    return _.chain(splitSections(nodes))
    .map(function(section, idx) {
        // Detect section type
        section.type = sectionType(section, idx);
        return section;
    })
    .map(function(section) {
        // Transform given type
        if(section.type === 'exercise') {
            return {
                type: section.type,
            };
        }

        // marked's Render expects this, we don't use it yet
        section.links = {};

        // Build options using defaults and our custom renderer
        var options = _.extend({}, marked.defaults, {
            renderer: renderer()
        });

        // Render normal pages
        return {
            type: section.type,
            content: marked.parser(section, options)
        };
    })
    .value();
}

// Exports
module.exports = parsePage;
