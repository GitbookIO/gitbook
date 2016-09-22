const Redux = require('redux');

module.exports = Redux.combineReducers({
    components: require('./components'),
    navigation: require('./navigation'),
    // GitBook JSON
    page:       require('./page'),
    summary:    require('./summary'),
    readme:    require('./readme')
});
