const path = require('path');
const { Record } = require('immutable');

const DEFAULTS = {
    type:  '',
    mtime: new Date(),
    path:  '',
    url:   ''
};

class File extends Record(DEFAULTS) {
    constructor(file = {}) {
        if (typeof file === 'string') {
            file = { path: file, url: file };
        }

        super({
            ...file,
            mtime: new Date(file.mtime)
        });
    }

    /**
     * Returns the relative path from this file to "to"
     * @param {String} to
     * @return {String}
     */
    relative(to) {
        return path.relative(
            path.dirname(this.path),
            to
        );
    }

    /**
     * Return true if file is an instance of File
     * @param {Mixed} file
     * @return {Boolean}
     */
    static is(file) {
        return (file instanceof File);
    }

    /**
     * Create a file instance
     * @param {Mixed|File} file
     * @return {File}
     */
    static create(file) {
        return File.is(file) ?
            file : new File(file);
    }
}

module.exports = File;
