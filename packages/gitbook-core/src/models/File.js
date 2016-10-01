const path = require('path');
const { Record } = require('immutable');

const DEFAULTS = {
    type:  '',
    mtime: '',
    path:  ''
};

class File extends Record(DEFAULTS) {
    constructor(file) {
        if (typeof file === 'string') {
            file = { path: file };
        }

        super(file);
    }

    /**
     * Return url for a file in a GitBook context.
     * @param {Context} context
     * @return {String} url
     */
    toURL(context) {
        const { file } = context.getState();

        return path.relative(
            path.dirname(file.path),
            this.path
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
