var Modifier = require('../modifier');
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
        Modifier.addHeadingId,
        Modifier.resolveLinks.bind(null,
            file.getPath(),
            resolveFile.bind(null, output)
        ),
        Modifier.annotateText(entries)
    ];
}

module.exports = getModifiers;
