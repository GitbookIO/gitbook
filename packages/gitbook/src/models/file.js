const path = require('path');
const { Record } = require('immutable');

const error = require('../utils/error');
const parsers = require('../parsers');

const DEFAULTS = {
    // Path of the file, relative to the FS
    path:  String(),
    // Time when file data last modified
    mtime: Date()
};

class File extends Record(DEFAULTS) {
    getPath() {
        return this.get('path');
    }

    getMTime() {
        return this.get('mtime');
    }

    /**
     * Return the file extension.
     * @return {String}
     */
    get extension() {
        return path.extname(this.getPath()).toLowerCase();
    }

    /**
     * Return the parser for this file..
     * @return {Parser}
     */
    get parser() {
        return parsers.getByExt(this.extension);
    }

    /**
     * Return type of file ('markdown' or 'asciidoc').
     * @return {String}
     */
    get type() {
        const { parser } = this;
        return parser ? parser.name : undefined;
    }

    /**
     * Does the file exists / is set.
     * @return {Boolean}
     */
    exists() {
        return Boolean(this.getPath());
    }

    /**
     * Read and parse the file.
     * @param  {FS} fs
     * @return {Promise<Document>} document
     */
    parse(fs) {
        const { parser } = this;

        if (!parser) {
            return Promise.reject(
                error.FileNotParsableError({
                    filename: this.path
                })
            );
        }

        return fs.readAsString(this.path)
        .then((content) => {
            const document = parser.toDocument(content);
            return document;
        });
    }

    getType() {
        return this.type;
    }

    getExtension() {
        return this.extension;
    }

    getParser() {
        return this.parser;
    }

    /**
     * Create a file from stats informations.
     * @param {String} filepath
     * @param {Object|fs.Stats} stat
     * @return {File}
     */
    static createFromStat(filepath, stat) {
        return new File({
            path: filepath,
            mtime: stat.mtime
        });
    }

    /**
     * Create a file with only a path.
     * @param {String} filepath
     * @return {File}
     */
    static createWithFilepath(filepath) {
        return new File({
            path: filepath
        });
    }
}

module.exports = File;
