var _ = require('lodash');

function isQuizNode(node) {
    return (/^[(\[][ x][)\]]/).test(node.text || node);
}

function isTableQuestion(nodes) {
    var block = questionBlock(nodes);
    return (
        block.length === 1 &&
        block[0].type === 'table' &&
        _.all(block[0].cells[0].slice(1), isQuizNode)
    );
}

function isListQuestion(nodes) {
    var block = questionBlock(nodes);
    // Counter of when we go in and out of lists
    var inlist = 0;
    // Number of lists we found
    var lists = 0;
    // Elements found outside a list
    var outsiders = 0;
    // Ensure that we have nothing except lists
    _.each(block, function(node) {
        if(node.type === 'list_start') {
            inlist++;
        } else if(node.type === 'list_end') {
            inlist--;
            lists++;
        } else if(inlist === 0) {
            // Found non list_start or list_end whilst outside a list
            outsiders++;
        }
    });
    return lists > 0 && outsiders === 0;
}

function isQuestion(nodes) {
    return isListQuestion(nodes) || isTableQuestion(nodes);
}

// Remove (optional) paragraph header node and blockquote
function questionBlock(nodes) {
    return nodes.slice(
        nodes[0].type === 'paragraph' ? 1 : 0,
        _.findIndex(nodes, { type: 'blockquote_start' })
    );
}

function splitQuestions(nodes) {
    // Represents nodes in current question
    var buffer = [];
    return _.reduce(nodes, function(accu, node) {
        // Add node to buffer
        buffer.push(node);

        // Flush buffer once we hit the end of a question
        if(node.type === 'blockquote_end') {
            accu.push(buffer);
            // Clear buffer
            buffer = [];
        }

        return accu;
    }, []);
}

function isQuiz(nodes) {
    // Extract potential questions
    var questions = splitQuestions(nodes);

    // Nothing that looks like questions
    if(questions.length === 0) {
        return false;
    }

    // Ensure all questions are correctly structured
    return _.all(questions, isQuestion);
}

module.exports = isQuiz;
