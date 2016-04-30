var Immutable = require('immutable');
var parsers = require('../parsers');

/**
    Return a list of all shortcuts that can apply
    to a file for a TemplatEngine

    @param {TemplateEngine} engine
    @param {String} filePath
    @return {List<Shortcut>}
*/
function listShortcuts(engine, filePath) {
    var blocks = engine.getBlocks();
    var parser = parsers.getForFile(filePath);
    if (!parser) {
        return Immutable.List();
    }

    return blocks
        .map(function(block) {
            var shortcuts = block.getShortcuts();

            return shortcuts.filter(function(shortcut) {
                var parsers = shortcut.get('parsers');
                return parsers.includes(parser.name);
            });
        })
        .flatten(1);
}

module.exports = listShortcuts;
