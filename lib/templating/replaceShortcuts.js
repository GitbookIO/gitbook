var escapeStringRegexp = require('escape-string-regexp');
var listShortcuts = require('./listShortcuts');

/*
    Apply a shortcut of block to a template
    @param {String} content
    @param {Shortcut} shortcut
    @return {String}
*/
function applyShortcut(content, shortcut) {
    var tags = shortcut.get('tag');
    var start = shortcut.get('start');
    var end = shortcut.get('end');

    var regex = new RegExp(
        escapeStringRegexp(start) + '([\\s\\S]*?[^\\$])' + escapeStringRegexp(end),
       'g'
    );
    return content.replace(regex, function(all, match) {
        return '{% ' + tags.start + ' %}' + match + '{% ' + tags.end + ' %}';
    });
}

/**
    Replace shortcuts from blocks in a string

    @param {TemplateEngine} engine
    @param {String} filePath
    @param {String} content
    @return {String}
*/
function replaceShortcuts(engine, filePath, content) {
    var shortcuts = listShortcuts(engine, filePath);
    return shortcuts.reduce(applyShortcut, content);
}

module.exports = replaceShortcuts;
