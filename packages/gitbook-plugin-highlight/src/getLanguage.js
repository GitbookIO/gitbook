const GitBook = require('gitbook-core');
const { List } = GitBook.Immutable;

const ALIASES = require('./ALIASES');

/**
 * Return language for a code blocks from a list of class names
 *
 * @param {String} className
 * @return {String}
 */
function getLanguage(className) {
    const lang = List(className.split(' '))
        .map((cl) => {
            // Markdown
            if (cl.search('lang-') === 0) {
                return cl.slice('lang-'.length);
            }

            // Asciidoc
            if (cl.search('language-') === 0) {
                return cl.slice('language-'.length);
            }

            return null;
        })
        .find((cl) => {
            return Boolean(cl);
        });

    return ALIASES[lang] || lang;
}

module.exports = getLanguage;
