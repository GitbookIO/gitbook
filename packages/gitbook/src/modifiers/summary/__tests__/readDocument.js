const path = require('path');
const read = require('read-metadata');
const { Raw } = require('slate');

const FIXTURES = path.resolve(__dirname, 'fixtures');

/**
 * Read a fixture document from a YAML file.
 * @param  {String} filename
 * @return {Document}
 */
function readDocument(filename) {
    filename = path.resolve(FIXTURES, filename);

    const yaml = read.sync(filename);
    const document = Raw.deserializeDocument(yaml, { terse: true });

    return document;
}

module.exports = readDocument;
