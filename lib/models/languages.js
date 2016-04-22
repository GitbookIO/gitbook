var Immutable = require('immutable');

var File = require('./file');

var Languages = Immutable.Record({
    file:       File(),
    list:       Immutable.OrderedMap()
});

Languages.prototype.getFile = function() {
    return this.get('file');
};

Languages.prototype.getList = function() {
    return this.get('list');
};

/**
    Get default languages

    @return {Language}
*/
Languages.prototype.getDefaultLanguage = function() {
    return this.getList().first();
};

/**
    Get a language by its ID

    @param {String} lang
    @return {Language}
*/
Languages.prototype.getLanguage = function(lang) {
    return this.getList().get(lang);
};

module.exports = Languages;
