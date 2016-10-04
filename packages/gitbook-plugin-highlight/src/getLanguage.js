const GitBook = require('gitbook-core');
const { List } = GitBook.Immutable;

/**
 * Return language for a code blocks from a list of class names
 *
 * @param {Array<String>}
 * @return {String}
 */
function getLanguage(classNames) {
    return List(classNames)
        .map(function(cl) {
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
        .find(function(cl) {
            return Boolean(cl);
        });
}

module.exports = getLanguage;
