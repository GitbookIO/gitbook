const { Record, Map, fromJS } = require('immutable');

const DEFAULTS = {
    title:      '',
    content:    '',
    dir:        'ltr',
    depth:      1,
    level:      '',
    previous:   null,
    next:       null,
    attributes: Map()
};

class Page extends Record(DEFAULTS) {
    static create(state = {}) {
        return state instanceof Page ?
            state : new Page({
                ...state,
                attributes: fromJS(state.attributes)
            });
    }
}

module.exports = Page;
