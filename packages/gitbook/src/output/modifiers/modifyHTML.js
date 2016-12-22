const cheerio = require('cheerio');
const Promise = require('../../utils/promise');

/**
 * Apply a list of operations to a page and
 * output the new page.
 *
 * @param {Page} page
 * @param {List|Array<Transformation>} operations
 * @return {Promise<Page>} page
 */
function modifyHTML(page, operations) {
    const html = page.getContent();
    const $ = cheerio.load(html);

    return Promise.forEach(operations, function(op) {
        return op($);
    })
    .then(function() {
        const resultHTML = $.html();
        return page.set('content', resultHTML);
    });
}

module.exports = modifyHTML;
