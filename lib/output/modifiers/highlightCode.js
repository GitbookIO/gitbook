var Promise = require('../../utils/promise');
var editHTMLElement = require('./editHTMLElement');

/**
    Highlight all code elements

    @param {Function(lang, body) -> String} highlight
    @param {HTMLDom} $
    @return {Promise}
*/
function highlightCode(highlight, $) {
    return editHTMLElement($, 'code', function($code) {
        var classNames = ($code.attr('class') || '').split(' ');
        var lang = classNames
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
        var source = $code.text();

        return Promise(highlight(lang, source))
        .then(function(r) {
            if (r.html) {
                $code.html(r.html);
            } else {
                $code.text(r.text);
            }
        });
    });
}

module.exports = highlightCode;
