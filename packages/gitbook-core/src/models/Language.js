const { Record } = require('immutable');

const DEFAULTS = {
    id:    null,
    title: null
};

class Language extends Record(DEFAULTS) {

}

module.exports = Language;
