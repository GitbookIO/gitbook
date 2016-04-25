var Templating = require('../../templating');
var JSONUtils = require('../../json');
var Modifiers = require('../modifiers');
var Writer = require('../writer');
var getModifiers = require('../getModifiers');
var createTemplateEngine = require('./createTemplateEngine');

/**
    Write a page as a json file

    @param {Output} output
    @param {Page} page
*/
function onPage(output, page) {
    var options = output.getOptions();
    var prefix = options.get('prefix');
    var engine = createTemplateEngine(output, page.getPath());

    return Modifiers.modifyHTML(page, getModifiers(output, page))
    .then(function(resultPage) {
        // Generate the context
        var context = JSONUtils.encodeBookWithPage(output.getBook(), resultPage);

        context.template = {
            getJSContext: function() {
                return {};
            }
        };

        // Render the theme
        return Templating.renderFile(engine, prefix + '/page.html', context)

        // Write it to the disk
        .then(function(html) {
            return Writer.writePage(output, resultPage, html);
        });
    });
}

module.exports = onPage;
