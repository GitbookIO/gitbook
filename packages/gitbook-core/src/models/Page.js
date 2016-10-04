const { Record } = require('immutable');

const DEFAULTS = {
    title:    '',
    content:  '',
    dir:      'ltr',
    depth:    1,
    level:    '',
    previous: null,
    next:     null
};

class Page extends Record(DEFAULTS) {
    static create(state) {
        return state instanceof Page ?
            state : new Page({
                ...state
            });
    }
}

module.exports = Page;
