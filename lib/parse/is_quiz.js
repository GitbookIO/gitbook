var _ = require('lodash');

function isQuizNode(node) {
    return (/^[(\[][ x][)\]]/).test(node.text || node);
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
        listIdx !== -1 && isQuizNode(quizNodes[listIdx + 1]) ||

        // Table of questions
        (
            tableIdx !== -1 &&
            // Last entry
            tableIdx === nodes.length - 1 &&
            _.every(quizNodes[tableIdx].cells[0].slice(1), isQuizNode)
        )
    ) {
        return true;
    }

    return false;
}

module.exports = isQuiz;
