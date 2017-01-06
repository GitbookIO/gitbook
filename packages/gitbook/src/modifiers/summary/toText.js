const summaryToDocument = require('./toDocument');
const parsers = require('../../parsers');
const error = require('../../utils/error');

/**
 * Return summary serialized as text.
 * @param  {Summary} summary
 * @param  {String} extension?
 * @return {String}
 */
function summaryToText(summary, extension) {
    const { file } = summary;
    const parser = extension ? parsers.getByExt(extension) : file.getParser();

    if (!parser) {
        throw error.FileNotParsableError({
            filename: file.path
        });
    }

    // Create a document representing the summary
    const document = summaryToDocument(summary);

    // Render the document as text
    return parser.toText(document);
}

module.exports = summaryToText;
