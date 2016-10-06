const Modifiers = require('./modifiers');

/**
 * Return default modifier to prepare a page for
 * rendering.
 *
 * @return {Array<Modifier>}
 */
function getModifiers(output, page) {
    const book = output.getBook();
    const glossary = book.getGlossary();
    const file = page.getFile();

    // Map of urls
    const urls = output.getURLIndex();

    // Glossary entries
    const entries = glossary.getEntries();
    const glossaryFile = glossary.getFile();
    const glossaryFilename = urls.resolveToURL(glossaryFile.getPath());

    // Current file path
    const currentFilePath = file.getPath();

    return [
        // Normalize IDs on headings
        Modifiers.addHeadingId,

        // Annotate text with glossary entries
        Modifiers.annotateText.bind(null, entries, glossaryFilename),

        // Resolve images
        Modifiers.resolveImages.bind(null, currentFilePath),

        // Resolve links (.md -> .html)
        Modifiers.resolveLinks.bind(null,
            currentFilePath,
            (filePath => urls.resolveToURL(filePath))
        )
    ];
}

module.exports = getModifiers;
