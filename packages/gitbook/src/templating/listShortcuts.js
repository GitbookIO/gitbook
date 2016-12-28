const { List } = require('immutable');
const parsers = require('../parsers');

/**
 * Return a list of all shortcuts that can apply
 * to a file for a TemplatEngine
 *
 * @param {List<TemplateBlock>} engine
 * @param {String} filePath
 * @return {List<TemplateShortcut>} shortcuts
 */
function listShortcuts(blocks, filePath) {
    const parser = parsers.getForFile(filePath);

    if (!parser) {
        return List();
    }

    return blocks
        .map((block) => {
            return block.getShortcuts();
        })
        .filter((shortcuts) => {
            return (
                shortcuts &&
                shortcuts.acceptParser(parser.getName())
            );
        });
}

module.exports = listShortcuts;
