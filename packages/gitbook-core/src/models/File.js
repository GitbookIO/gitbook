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

    static is(file) {
        return (file instanceof File);
    }

    static create(file) {
        return file instanceof File ?
            file : new File(file);
    }
}

module.exports = File;
