const path = require('path');
const { Record } = require('immutable');

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
     * Does the file exists / is set.
     * @return {Boolean}
     */
    exists() {
        return Boolean(this.getPath());
    }

    /**
     * Return type of file ('markdown' or 'asciidoc').
     * @return {String}
     */
    getType() {
        const parser = this.getParser();
        if (parser) {
            return parser.name;
        } else {
            return undefined;
        }
    }

    /**
     * Return extension of this file (lowercased).
     * @return {String}
     */
    getExtension() {
        return path.extname(this.getPath()).toLowerCase();
    }

    /**
     * Return parser for this file.
     * @return {Parser}
     */
    getParser() {
        return parsers.getByExt(this.getExtension());
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
