var juice = require('juice');

var WebsiteGenerator = require('../website');
var JSONUtils = require('../../json');
var Templating = require('../../templating');
var Promise = require('../../utils/promise');


/**
    Generate PDF header/footer templates

    @param {Output} output
    @param {String} type
    @return {String}
*/
function getPDFTemplate(output, type) {
    var filePath = 'pdf_' + type + '.html';
    var outputRoot = output.getRoot();
    var engine = WebsiteGenerator.createTemplateEngine(output, filePath);

    // Generate context
    var context = JSONUtils.encodeOutput(output);
    context.page = {
        num: '_PAGENUM_',
        title: '_TITLE_',
        section: '_SECTION_'
    };

    // Render the theme
    return Templating.renderFile(engine, 'ebook/' + filePath, context)

    // Inline css and assets
    .then(function(html) {
        return Promise.nfcall(juice.juiceResources, html, {
            webResources: {
                relativeTo: outputRoot
            }
        });
    });
}

module.exports = getPDFTemplate;
