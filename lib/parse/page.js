var _ = require('lodash');
var marked = require('marked');
var hljs = require('highlight.js');

var renderer = require('./renderer');

// Synchronous highlighting with highlight.js
marked.setOptions({
    highlight: function (code, lang) {
        try {
            return hljs.highlight(lang, code).value;
        } catch(e) {
            return hljs.highlightAuto(code).value;
        }
    }
});


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

// Render a section using our custom renderer
function render(section) {
    // marked's Render expects this, we don't use it yet
    section.links = {};

    // Build options using defaults and our custom renderer
    var options = _.extend({}, marked.defaults, {
        renderer: renderer()
    });

    return marked.parser(section, options);
}

function parsePage(src) {
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
    .map(function(section) {
        // Generate a uniqueId to identify this section in our code
        var id = _.uniqueId('gitbook_');

        // Transform given type
        if(section.type === 'exercise') {
            var nonCodeNodes = _.reject(section, {
                'type': 'code'
            });

            var codeNodes = _.filter(section, {
                'type': 'code'
            });

            return {
                id: id,
                type: section.type,
                content: render(nonCodeNodes),
                code: {
                    base: codeNodes[0].text,
                    solution: codeNodes[1].text,
                    validation: codeNodes[2].text,
                }
            };
        }

        // Render normal pages
        return {
            id: id,
            type: section.type,
            content: render(section)
        };
    })
    .value();
}

// Exports
module.exports = parsePage;
