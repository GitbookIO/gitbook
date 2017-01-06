const { Record } = require('immutable');
const slug = require('github-slugid');

const DEFAULTS = {
    name:        String(),
    description: String()
};

/**
 * A definition represents an entry in the glossary.
 * @param {Class}
 */

class GlossaryEntry extends Record(DEFAULTS) {

    /**
     * Get identifier for this entry
     *
     * @return {String}
     */
    get id() {
        return GlossaryEntry.nameToID(this.name);
    }

    getName() {
        return this.get('name');
    }

    getDescription() {
        return this.get('description');
    }

    getID() {
        return this.id;
    }


    /**
     * Normalize a glossary entry name into a unique id
     *
     * @param {String}
     * @return {String}
     */
    static nameToID(name) {
        return slug(name);
    }
}

module.exports = GlossaryEntry;
