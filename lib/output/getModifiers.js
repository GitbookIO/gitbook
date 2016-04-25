var Modifiers = require('./modifiers');
var resolveFile = require('./resolveFile');

/**
    Return default modifier to prepare a page

    @return <Array>
*/
function getModifiers(output, page) {
    var book = output.getBook();
    var glossary = book.getGlossary();
    var entries = glossary.getEntries();

    var file = page.getFile();

    return [
        Modifiers.addHeadingId,
        Modifiers.resolveLinks.bind(null,
            file.getPath(),
            resolveFile.bind(null, output)
        ),
        Modifiers.annotateText.bind(null, entries)
    ];
}

module.exports = getModifiers;
