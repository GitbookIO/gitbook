const { Record, OrderedMap } = require('immutable');

const File = require('./file');
const GlossaryEntry = require('./glossaryEntry');

const DEFAULTS = {
    file:    new File(),
    entries: OrderedMap()
};

class Glossary extends Record(DEFAULTS) {
    getFile() {
        return this.get('file');
    }

    getEntries() {
        return this.get('entries');
    }

    /**
     * Return an entry by its name.
     * @param {String} name
     * @return {GlossaryEntry}
     */
    getEntry(name) {
        const { entries } = this;
        const id = GlossaryEntry.nameToID(name);

        return entries.get(id);
    }

    /**
     * Add/Replace an entry to a glossary.
     * @param {GlossaryEntry} entry
     * @return {Glossary}
     */
    addEntry(entry) {
        const id = entry.getID();
        let { entries } = this;

        entries = entries.set(id, entry);
        return this.set('entries', entries);
    }

    /**
     * Add/Replace an entry to a glossary by name/description.
     * @param {GlossaryEntry} entry
     * @return {Glossary}
     */
    addEntryByName(name, description) {
        const entry = new GlossaryEntry({
            name,
            description
        });

        return this.addEntry(entry);
    }

    /**
     * Create a glossary from a list of entries.
     *
     * @param {Array|List} entries
     * @return {Glossary}
     */
    static createFromEntries(entries) {
        entries = entries.map((entry) => {
            if (!(entry instanceof GlossaryEntry)) {
                entry = new GlossaryEntry(entry);
            }

            return [entry.id, entry];
        });

        return new Glossary({
            entries: OrderedMap(entries)
        });
    }
}

module.exports = Glossary;
