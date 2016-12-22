const Immutable = require('immutable');
const fm = require('front-matter');
const direction = require('direction');

/**
 * Parse a page, its content and the YAMl header
 *
 * @param {Page} page
 * @return {Page}
 */
function parsePageFromString(page, content) {
    const parsed = fm(content);

    return page.merge({
        content:    parsed.body,
        attributes: Immutable.fromJS(parsed.attributes),
        dir:        direction(parsed.body)
    });
}


module.exports = parsePageFromString;
