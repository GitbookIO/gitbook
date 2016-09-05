const Immutable = require('immutable');
const parsers = require('../parsers');

/**
 * Return a list of all shortcuts that can apply
 * to a file for a TemplatEngine
 *
 * @param {List<TemplateBlock>} engine
 * @param {String} filePath
 * @return {List<TemplateShortcut>}
 */
function listShortcuts(blocks, filePath) {
    const parser = parsers.getForFile(filePath);

    if (!parser) {
        return Immutable.List();
    }

    return blocks
        .map(function(block) {
            return block.getShortcuts();
        })
        .filter(function(shortcuts) {
            return (
                shortcuts &&
                shortcuts.acceptParser(parser.getName())
            );
        });
}

module.exports = listShortcuts;
