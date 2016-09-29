const ACTION_TYPES = require('./TYPES');

/**
 * Register messages for a locale
 * @param {String} locale
 * @param {Map<String:String>} messages
 * @return {Action}
 */
function registerLocale(locale, messages) {
    return { type: ACTION_TYPES.I18N_REGISTER_LOCALE, locale, messages };
}

module.exports = {
    registerLocale
};
