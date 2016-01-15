var _ = require('lodash');
var path = require('path');
var fs = require('fs');

var i18n = require('i18n');

var I18N_PATH = path.resolve(__dirname, '../../theme/i18n/');
var DEFAULT_LANGUAGE = 'en';
var LOCALES = _.map(fs.readdirSync(I18N_PATH), function(lang) {
    return path.basename(lang, '.json');
});

i18n.configure({
    locales: LOCALES,
    directory: I18N_PATH,
    defaultLocale: DEFAULT_LANGUAGE,
    updateFiles: false
});

function compareLocales(lang, locale) {
    var langMain = _.first(lang.split('-'));
    var langSecond = _.last(lang.split('-'));

    var localeMain = _.first(locale.split('-'));
    var localeSecond = _.last(locale.split('-'));

    if (locale == lang) return 100;
    if (localeMain == langMain) return 50;
    if (localeSecond == langSecond) return 20;
    return 0;
}

var normalizeLanguage = _.memoize(function(lang) {
    var language = _.chain(LOCALES)
        .values()
        .map(function(locale) {
            return {
                locale: locale,
                score: compareLocales(lang, locale)
            };
        })
        .filter(function(lang) {
            return lang.score > 0;
        })
        .sortBy('score')
        .pluck('locale')
        .last()
        .value();
    return language || lang;
});

function translate(locale, phrase) {
    var args = Array.prototype.slice.call(arguments, 2);

    return i18n.__.apply({}, [{
        locale: locale,
        phrase: phrase
    }].concat(args));
}

function getCatalog(locale) {
    locale = normalizeLanguage(locale);
    return i18n.getCatalog(locale);
}

function getLocales() {
    return LOCALES;
}

function hasLocale(locale) {
    return _.contains(LOCALES, locale);
}

module.exports = {
    __: translate,
    normalizeLanguage: normalizeLanguage,
    getCatalog: getCatalog,
    getLocales: getLocales,
    hasLocale: hasLocale
};
