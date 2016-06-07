var Immutable = require('immutable');
var matter = require('gray-matter');
var direction = require('direction');

/**
 * Parse a page, its content and the YAMl header
 *
 * @param {Page} page
 * @return {Page}
 */
function parsePageFromString(page, content) {
    var parsed = matter(content);

    return page.merge({
        content:    parsed.content,
        attributes: Immutable.fromJS(parsed.data),
        dir:        direction(parsed.content)
    });
}


module.exports = parsePageFromString;
