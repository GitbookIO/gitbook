var _ = require('lodash');
var kramed = require('kramed');

var isExercise = require('./is_exercise');
var isQuiz = require('./is_quiz');

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
    if(isExercise(nodes)) {
        return 'exercise';
    } else if(isQuiz(nodes)) {
        return 'quiz';
    }

    return 'normal';
}

// Generate a uniqueId to identify this section in our code
function sectionId(section, idx) {
    return _.uniqueId('gitbook_');
}

function lexPage(src) {
    // Lex file
    var nodes = kramed.lexer(src);

    return _.chain(splitSections(nodes))
    .map(function(section, idx) {
        // Detect section type
        section.type = sectionType(section, idx);
        return section;
    })
    .map(function(section, idx) {
        // Give each section an ID
        section.id = sectionId(section, idx);
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
        section.links = nodes.links;
        return section;
    })
    .value();
}

// Exports
module.exports = lexPage;
