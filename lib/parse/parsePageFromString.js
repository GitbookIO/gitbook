var Immutable = require('immutable');
var fm = require('front-matter');
var direction = require('direction');

/**
 * Parse a page, its content and the YAMl header
 *
 * @param {Page} page
 * @return {Page}
 */
function parsePageFromString(page, content) {
    // Parse page YAML
    var parsed = fm(content);

    return page.merge({
        content:    parsed.body,
        attributes: Immutable.fromJS(parsed.attributes),
        dir:        direction(parsed.body)
    });
}


module.exports = parsePageFromString;
