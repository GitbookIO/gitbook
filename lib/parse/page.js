var _ = require('lodash');
var marked = require('marked');
var hljs = require('highlight.js');

var lex = require('./lex');
var renderer = require('./renderer');

var lnormalize = require('../utils/lang').normalize;


// Synchronous highlighting with highlight.js
marked.setOptions({
    highlight: function (code, lang) {
        try {
            return hljs.highlight(lang, code).value;
        } catch(e) {
            return hljs.highlightAuto(code).value;
        }
    }
});


// Render a section using our custom renderer
function render(section, _options) {
    // Copy section
    section = _.toArray(section);

    // marked's Render expects this, we don't use it yet
    section.links = {};

    // Build options using defaults and our custom renderer
    var options = _.extend({}, marked.defaults, {
        renderer: renderer(null, _options)
    });

    return marked.parser(section, options);
}

function parsePage(src, options) {
    options = options || {};

    // Lex if not already lexed
    return (_.isArray(src) ? src : lex(src))
    .map(function(section) {
        // Transform given type
        if(section.type === 'exercise') {
            var nonCodeNodes = _.reject(section, {
                'type': 'code'
            });

            var codeNodes = _.filter(section, {
                'type': 'code'
            });

            // Languages in code blocks
            var langs = _.pluck(codeNodes, 'lang').map(lnormalize);

            // Check that they are all the same
            var validLangs = _.all(_.map(langs, function(lang) {
                return lang && lang === langs[0];
            }));

            // Main language
            var lang = validLangs ? langs[0] : null;

            return {
                id: section.id,
                type: section.type,
                content: render(nonCodeNodes),
                lang: lang,
                code: {
                    base: codeNodes[0].text,
                    solution: codeNodes[1].text,
                    validation: codeNodes[2].text,
                }
            };
        }

        // Render normal pages
        return {
            id: section.id,
            type: section.type,
            content: render(section, options)
        };
    });
}

// Exports
module.exports = parsePage;
