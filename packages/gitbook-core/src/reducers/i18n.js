const { Record, Map } = require('immutable');
const ACTION_TYPES = require('../actions/TYPES');

const I18nState = Record({
    locale: 'en',
    // Map of locale -> Map<String:String>
    messages: Map()
});

function reduceI18n(state, action) {
    state = state || I18nState();
    switch (action.type) {

    case ACTION_TYPES.I18N_REGISTER_LOCALE:
        return state.merge({
            messages: state.messages.set(action.locale, Map(action.messages))
        });

    default:
        return state;

    }
}

module.exports = reduceI18n;
