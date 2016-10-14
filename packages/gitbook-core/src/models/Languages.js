const { Record, List } = require('immutable');
const Language = require('./Language');
const File = require('./File');

const DEFAULTS = {
    current: String(),
    file:    new File(),
    list:    List()
};

class Languages extends Record(DEFAULTS) {
    constructor(spec = {}) {
        super({
            ...spec,
            file: File.create(spec.file),
            list: List(spec.list).map(lang => new Language(lang))
        });
    }

    /**
     * Return true if file is an instance of Languages
     * @param {Mixed} langs
     * @return {Boolean}
     */
    static is(langs) {
        return (langs instanceof Languages);
    }

    /**
     * Create a Languages instance
     * @param {Mixed|Languages} langs
     * @return {Languages}
     */
    static create(langs) {
        return Languages.is(langs) ?
            langs : new Languages(langs);
    }
}

module.exports = Languages;
