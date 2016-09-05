const juice = require('juice');

const WebsiteGenerator = require('../website');
const JSONUtils = require('../../json');
const Templating = require('../../templating');
const Promise = require('../../utils/promise');


/**
    Generate PDF header/footer templates

    @param {Output} output
    @param {String} type
    @return {String}
*/
function getPDFTemplate(output, type) {
    const filePath = 'pdf_' + type + '.html';
    const outputRoot = output.getRoot();
    const engine = WebsiteGenerator.createTemplateEngine(output, filePath);

    // Generate context
    const context = JSONUtils.encodeOutput(output);
    context.page = {
        num: '_PAGENUM_',
        title: '_SECTION_'
    };

    // Render the theme
    return Templating.renderFile(engine, 'ebook/' + filePath, context)

    // Inline css and assets
    .then(function(tplOut) {
        return Promise.nfcall(juice.juiceResources, tplOut.getContent(), {
            webResources: {
                relativeTo: outputRoot
            }
        });
    });
}

module.exports = getPDFTemplate;
