const { Record } = require('immutable');
const IgnoreMutable = require('ignore');

/*
    Immutable version of node-ignore
*/

const DEFAULTS = {
    ignore: new IgnoreMutable()
};

class Ignore extends Record(DEFAULTS) {
    getIgnore() {
        return this.get('ignore');
    }

    /**
     * Test if a file is ignored by these rules.
     * @param {String} filePath
     * @return {Boolean} isIgnored
     */
    isFileIgnored(filename) {
        const ignore = this.getIgnore();
        return ignore.filter([filename]).length == 0;
    }

    /**
     * Add rules.
     * @param {String}
     * @return {Ignore}
     */
    add(rule) {
        const ignore = this.getIgnore();
        const newIgnore = new IgnoreMutable();

        newIgnore.add(ignore);
        newIgnore.add(rule);

        return this.set('ignore', newIgnore);
    }
}

module.exports = Ignore;
