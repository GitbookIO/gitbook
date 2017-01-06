const { OrderedMap, Record } = require('immutable');

const File = require('./file');
const Language = require('./language');

const DEFAULTS = {
    file: new File(),
    list: OrderedMap()
};

class Languages extends Record(DEFAULTS) {
    getFile() {
        return this.get('file');
    }

    getList() {
        return this.get('list');
    }

    /**
     * Get default languages
     * @return {Language}
     */
    getDefaultLanguage() {
        return this.list.first();
    }

    /**
     * Get a language by its ID.
     * @param {String} lang
     * @return {Language}
     */
    getLanguage(lang) {
        return this.list.get(lang);
    }

    /**
     * Return count of langs.
     * @return {Number}
     */
    getCount() {
        return this.list.size;
    }

    /**
     * Create a languages list from a JS object
     *
     * @param {Array}
     * @return {Language}
     */
    static createFromList(langs) {
        let list = OrderedMap();

        langs.forEach((lang) => {
            lang = new Language({
                title: lang.title,
                path: lang.path || lang.ref
            });
            list = list.set(lang.getID(), lang);
        });

        return new Languages({
            list
        });
    }
}

module.exports = Languages;
