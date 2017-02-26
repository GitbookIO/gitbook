const Git = require('../utils/git');

/**
 * Fetch a reference "ref" relative to "file".
 * @param {Book} book
 * @param {File} file
 * @param {String} ref
 * @return {Promise<Slate.Fragment>}
 */
function fetchReference(book, file, ref) {

}

/**
 * Include another file. It replaces the templating node with content from the other file.
 *
 * @param  {Slate.Block} node
 * @return {Promise<List<Block>>}
 */
function include(book, file, node) {
    const ref = node.data.get('props').get(0);

    return fetchReference(book, file, ref)
    .then((fragment) => {

    });
}

module.exports = include;
