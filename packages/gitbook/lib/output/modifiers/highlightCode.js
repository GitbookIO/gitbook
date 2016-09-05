var is = require('is');
var Immutable = require('immutable');

var Promise = require('../../utils/promise');
var editHTMLElement = require('./editHTMLElement');

/**
    Return language for a code blocks from a list of class names

    @param {Array<String>}
    @return {String}
*/
function getLanguageForClass(classNames) {
    return Immutable.List(classNames)
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


/**
    Highlight all code elements

    @param {Function(lang, body) -> String} highlight
    @param {HTMLDom} $
    @return {Promise}
*/
function highlightCode(highlight, $) {
    return editHTMLElement($, 'code', function($code) {
        var classNames = ($code.attr('class') || '').split(' ');
        var lang = getLanguageForClass(classNames);
        var source = $code.text();

        return Promise(highlight(lang, source))
        .then(function(r) {
            if (is.string(r.html)) {
                $code.html(r.html);
            } else {
                $code.text(r.text);
            }
        });
    });
}

module.exports = highlightCode;
