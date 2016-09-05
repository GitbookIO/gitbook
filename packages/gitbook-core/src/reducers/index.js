const Redux = require('redux');

module.exports = Redux.combineReducers({
    components: require('./components')
});
