var Modifiers = require('./modifiers');
var resolveFileToURL = require('./helper/resolveFileToURL');
var Api = require('../api');
var Plugins = require('../plugins');
var Promise = require('../utils/promise');
var defaultBlocks = require('../constants/defaultBlocks');

var CODEBLOCK = 'code';

/**
    Return default modifier to prepare a page for
    rendering.

    @return <Array>
*/
function getModifiers(output, page) {
    var book = output.getBook();
    var plugins = output.getPlugins();
    var glossary = book.getGlossary();
    var entries = glossary.getEntries();
    var file = page.getFile();

    // Get TemplateBlock for highlighting
    var blocks = Plugins.listBlocks(plugins);
    var code = blocks.get(CODEBLOCK) || defaultBlocks.get(CODEBLOCK);

    // Current context
    var context = Api.encodeGlobal(output);

    return [
        // Normalize IDs on headings
        Modifiers.addHeadingId,

        // Resolve links (.md -> .html)
        Modifiers.resolveLinks.bind(null,
            file.getPath(),
            resolveFileToURL.bind(null, output)
        ),

        // Annotate text with glossary entries
        Modifiers.annotateText.bind(null, entries),

        // Highlight code blocks using "code" block
        Modifiers.highlightCode.bind(null, function(lang, source) {
            return Promise(code.applyBlock({
                body: source,
                kwargs: {
                    language: lang
                }
            }, context))
            .then(function(result) {
                if (result.html === false) {
                    return { text: result.body };
                } else {
                    return { html: result.body };
                }
            });
        })
    ];
}

module.exports = getModifiers;
