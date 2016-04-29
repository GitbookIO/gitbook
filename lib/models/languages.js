var Immutable = require('immutable');

var File = require('./file');
var Language = require('./language');

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


/**
    Create a languages list from a JS object

    @param {File}
    @param {Array}
    @return {Language}
*/
Languages.createFromList = function(file, langs) {
    var list = Immutable.OrderedMap();

    langs.forEach(function(lang) {
        lang = Language({
            title: lang.title,
            path: lang.path
        });
        list = list.set(lang.getID(), lang);
    });

    return Languages({
        file: file,
        list: list
    });
}

module.exports = Languages;
