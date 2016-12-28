const path = require('path');

const Promise = require('../utils/promise');
const error = require('../utils/error');
const timing = require('../utils/timing');

const Templating = require('../templating');
const JSONUtils = require('../json');
const createTemplateEngine = require('./createTemplateEngine');
const callPageHook = require('./callPageHook');

/**
 * Prepare and generate HTML for a page
 *
 * @param {Output} output
 * @param {Page} page
 * @return {Promise<Page>}
 */
function generatePage(output, page) {
    const book = output.getBook();
    const engine = createTemplateEngine(output);

    return timing.measure(
        'page.generate',
        Promise(page)
        .then(function(resultPage) {
            const file = resultPage.getFile();
            const filePath = file.getPath();
            const parser = file.getParser();
            const context = JSONUtils.encodeState(output, resultPage);

            if (!parser) {
                return Promise.reject(error.FileNotParsableError({
                    filename: filePath
                }));
            }

            // Call hook "page:before"
            return callPageHook('page:before', output, resultPage)

            // Escape code blocks with raw tags
            .then((currentPage) => {
                return parser.preparePage(currentPage.getContent());
            })

            // Render templating syntax
            .then((content) => {
                const absoluteFilePath = path.join(book.getContentRoot(), filePath);
                return Templating.render(engine, absoluteFilePath, content, context);
            })

            // Parse with markdown/asciidoc parser
            .then(content => parser.parsePage(content))

            // Return new page
            .then(({content}) => {
                return resultPage.set('content', content);
            })

            // Call final hook
            .then((currentPage) => {
                return callPageHook('page', output, currentPage);
            });
        })
    );
}

module.exports = generatePage;
