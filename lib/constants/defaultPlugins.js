var Immutable = require('immutable');

/*
    List of default plugins for all books,
    default plugins should be installed in node dependencies of GitBook
*/
module.exports = Immutable.List([
    'highlight',
    'search',
    'lunr',
    'sharing',
    'fontsettings',
    'theme-default'
]);
