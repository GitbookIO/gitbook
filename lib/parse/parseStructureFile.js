var Promise = require('../utils/promise');
var error = require('../utils/error');
var lookupStructureFile = require('./lookupStructureFile');

/**
    Parse a ParsableFile using a specific method

    @param {FS} fs
    @param {ParsableFile} file
    @param {String} type
    @return {Promise<Array<String, List|Map>>}
*/
function parseFile(fs, file, type) {
    var filepath = file.getPath();
    var parser = file.getParser();

    if (!parser) {
        return Promise.reject(
            error.FileNotParsableError({
                filename: filepath
            })
        );
    }

    return fs.readAsString(filepath)
    .then(function(content) {
        if (type === 'readme') {
            return parser.parseReadme(content);
        } else if (type === 'glossary') {
            return parser.parseGlossary(content);
        } else if (type === 'summary') {
            return parser.parseSummary(content);
        } else if (type === 'langs') {
            return parser.parseLanguages(content);
        } else {
            throw new Error('Parsing invalid type "' + type + '"');
        }
    })
    .then(function(result) {
        return [
            file,
            result
        ];
    });
}


/**
    Parse a structure file (ex: SUMMARY.md, GLOSSARY.md).
    It uses the configuration to find the specified file.

    @param {Book} book
    @param {String} type: one of ["glossary", "readme", "summary"]
    @return {Promise<List|Map>}
*/
function parseStructureFile(book, type) {
    var fs = book.getContentFS();

    return lookupStructureFile(book, type)
    .then(function(file) {
        if (!file) return [undefined, undefined];

        return parseFile(fs, file, type);
    });
}

module.exports = parseStructureFile;
