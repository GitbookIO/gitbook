const Redux = require('redux');

const identity = ((state, action) => state || {});

module.exports = Redux.combineReducers({
    components: require('./components'),
    navigation: require('./navigation'),

    // GitBook JSON
    page:    identity,
    summary: identity,
    readme:  identity
});
