var _ = require('lodash');

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

module.exports = isExercise;
