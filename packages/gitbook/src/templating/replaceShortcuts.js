const escapeStringRegexp = require('escape-string-regexp');
const listShortcuts = require('./listShortcuts');

/**
 * Apply a shortcut of block to a template
 * @param {String} content
 * @param {Shortcut} shortcut
 * @return {String}
 */
function applyShortcut(content, shortcut) {
    const start = shortcut.getStart();
    const end = shortcut.getEnd();

    const tagStart = shortcut.getStartTag();
    const tagEnd = shortcut.getEndTag();

    const regex = new RegExp(
        escapeStringRegexp(start) + '([\\s\\S]*?[^\\$])' + escapeStringRegexp(end),
       'g'
    );
    return content.replace(regex, function(all, match) {
        return '{% ' + tagStart + ' %}' + match + '{% ' + tagEnd + ' %}';
    });
}

/**
 * Replace shortcuts from blocks in a string
 *
 * @param {List<TemplateBlock>} engine
 * @param {String} filePath
 * @param {String} content
 * @return {String}
 */
function replaceShortcuts(blocks, filePath, content) {
    const shortcuts = listShortcuts(blocks, filePath);
    return shortcuts.reduce(applyShortcut, content);
}

module.exports = replaceShortcuts;
