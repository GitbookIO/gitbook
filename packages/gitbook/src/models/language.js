const path = require('path');
const { Record } = require('immutable');

const DEFAULTS = {
    title: String(),
    path:  String()
};

class Language extends Record(DEFAULTS) {
    get id() {
        return path.basename(this.path);
    }

    getTitle() {
        return this.get('title');
    }

    getPath() {
        return this.get('path');
    }

    getID() {
        return this.id;
    }
}

module.exports = Language;
