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

function isQuizNode(node) {
    return (/^[(\[][ x][)\]]/).test(node.text || node);
}

function isExercise(nodes) {
    var codeType = { type: 'code' };

    // Number of code nodes in section
    var len = _.filter(nodes, codeType).length;

    return (
        // Got 3 or 4 code blocks
        (len === 3 || len === 4) &&
        // Ensure all nodes are at the end
        _.all(_.last(nodes, len), codeType)
    );
}

function isQuiz(nodes) {
    if (nodes.length < 3) {
        return false;
    }

    // Support having a first paragraph block
    // before our series of questions
    var quizNodes = nodes.slice(nodes[0].type === 'paragraph' ? 1 : 0);

    // No questions
    if (!_.some(quizNodes, { type: 'blockquote_start' })) {
        return false;
    }

    // Check if section has list of questions
    // or table of questions
    var listIdx = _.findIndex(quizNodes, { type: 'list_item_start' });
    var tableIdx = _.findIndex(quizNodes, { type: 'table' });

    if(
        // List of questions
        listIdx !== -1 && isQuizNode(quizNodes[listIdx + 1]) &&

        // Table of questions
        (
            tableIdx !== -1 &&
            _.every(quizNodes[tableIdx].cells[0].slice(1), isQuizNode)
        )
    ) {
        return true;
    }

    return false;
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
    var nodes = marked.lexer(src);

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
    .value();
}

// Exports
module.exports = lexPage;
