var Immutable = require('immutable');
var parsers = require('../parsers');

/**
    Return a list of all shortcuts that can apply
    to a file for a TemplatEngine

    @param {TemplateEngine} engine
    @param {String} filePath
    @return {List<TemplateShortcut>}
*/
function listShortcuts(engine, filePath) {
    var blocks = engine.getBlocks();
    var parser = parsers.getForFile(filePath);

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
