const { Record } = require('immutable');
const File = require('./file');

const DEFAULTS = {
    file:        new File()
};

class Readme extends Record(DEFAULTS) {
    getFile() {
        return this.get('file');
    }

    /**
     * Set file linked to the readme.
     * @param  {File} file
     * @return {Readme}
     */
    setFile(file) {
        return this.merge({ file });
    }

    /**
     * Create a new readme
     *
     * @param {Object} def
     * @return {Readme}
     */
    static create(def) {
        def = def || {};

        return new Readme({
            file: def.file || ''
        });
    }
}

module.exports = Readme;
