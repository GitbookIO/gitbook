var WebsiteGenerator = require('../website');
var JSONUtils = require('../../json');
var Templating = require('../../templating');
var writeFile = require('../helper/writeFile');

/**
    Finish the generation, generates the SUMMARY.html

    @param {Output}
    @return {Output}
*/
function onFinish(output) {
    var book = output.getBook();
    var options = output.getOptions();
    var prefix = options.get('prefix');

    var filePath = 'SUMMARY.html';
    var engine = WebsiteGenerator.createTemplateEngine(output, filePath);
    var context = JSONUtils.encodeOutput(output);

    // Render the theme
    return Templating.renderFile(engine, prefix + '/SUMMARY.html', context)

    // Write it to the disk
    .then(function(html) {
        return writeFile(output, filePath, html);
    });
}

module.exports = onFinish;
