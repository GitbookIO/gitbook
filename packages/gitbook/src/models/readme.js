const { Record } = require('immutable');
const File = require('./file');

const DEFAULTS = {
    file:        new File(),
    title:       String(),
    description: String()
};

class Readme extends Record(DEFAULTS) {
    getFile() {
        return this.get('file');
    }

    getTitle() {
        return this.get('title');
    }

    getDescription() {
        return this.get('description');
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
     * @param {File} file
     * @param {Object} def
     * @return {Readme}
     */
    static create(def) {
        def = def || {};

        return new Readme({
            title: def.title || '',
            description: def.description || ''
        });
    }
}

module.exports = Readme;
