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

/**
 * Register multiple locales
 * @param {Map<String:Object>} locales
 * @return {Action}
 */
function registerLocales(locales) {
    return (dispatch) => {
        for (const locale in locales) {
            if (!locales.hasOwnProperty(locale)) {
                continue;
            }

            dispatch(registerLocale(locale, locales[locale]));
        }
    };
}

module.exports = {
    registerLocale,
    registerLocales
};
