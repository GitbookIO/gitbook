var Templating = require('../../templating');
var JSONUtils = require('../../json');
var Modifiers = require('../modifiers');
var writeFile = require('../helper/writeFile');
var getModifiers = require('../getModifiers');
var createTemplateEngine = require('./createTemplateEngine');
var fileToOutput = require('../helper/fileToOutput');

/**
    Write a page as a json file

    @param {Output} output
    @param {Page} page
*/
function onPage(output, page) {
    var options = output.getOptions();
    var file = page.getFile();
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

        // Output file path
        var filePath = fileToOutput(output, file.getPath());

        // Render the theme
        return Templating.renderFile(engine, prefix + '/page.html', context)

        // Write it to the disk
        .then(function(html) {
            return writeFile(output, filePath, html);
        });
    });
}

module.exports = onPage;
