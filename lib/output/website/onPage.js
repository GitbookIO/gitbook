var path = require('path');
var omit = require('omit-keys');

var Templating = require('../../templating');
var Plugins = require('../../plugins');
var JSONUtils = require('../../json');
var LocationUtils = require('../../utils/location');
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
    var book = output.getBook();
    var plugins = output.getPlugins();

    var engine = createTemplateEngine(output, page.getPath());

    // Output file path
    var filePath = fileToOutput(output, file.getPath());

    // Calcul relative path to the root
    var outputDirName = path.dirname(filePath);
    var basePath = LocationUtils.normalize(path.relative(outputDirName, './'));

    return Modifiers.modifyHTML(page, getModifiers(output, page))
    .then(function(resultPage) {
        // Generate the context
        var context = JSONUtils.encodeBookWithPage(output.getBook(), resultPage);
        context.plugins = {
            resources: Plugins.listResources(plugins, prefix).toJS()
        };

        context.template = {
            getJSContext: function() {
                return {
                    page: omit(context.page, 'content'),
                    config: context.config,
                    file: context.file,
                    gitbook: context.gitbook,
                    basePath: basePath,
                    book: {
                        language: book.getLanguage()
                    }
                };
            }
        };

        // Render the theme
        return Templating.renderFile(engine, prefix + '/page.html', context)

        // Write it to the disk
        .then(function(html) {
            return writeFile(output, filePath, html);
        });
    });
}

module.exports = onPage;
