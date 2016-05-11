var mergeAtLevel = require('./mergeAtLevel');

/**
    Edit the ref of an article

    @param {Summary} summary
    @param {String} level
    @param {String} newRef
    @return {Summary}
*/
function editArticleRef(summary, level, newRef) {
    return mergeAtLevel(summary, level, {
        ref: newRef
    });
}

module.exports = editArticleRef;
