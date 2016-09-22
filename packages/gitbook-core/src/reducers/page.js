const { Record } = require('immutable');

const DEFAULTS = {
    title:   '',
    content: '',
    dir:     'ltr',
    depth:   1,
    level:   ''
};

class PageState extends Record(DEFAULTS) {
    static create(state) {
        return state instanceof PageState ?
            state : new PageState(state);
    }
}

module.exports = (state, action) => {
    return PageState.create(state);
};
