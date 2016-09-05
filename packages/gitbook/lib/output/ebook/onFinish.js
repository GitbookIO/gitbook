var path = require('path');

var WebsiteGenerator = require('../website');
var JSONUtils = require('../../json');
var Templating = require('../../templating');
var Promise = require('../../utils/promise');
var error = require('../../utils/error');
var command = require('../../utils/command');
var writeFile = require('../helper/writeFile');

var getConvertOptions = require('./getConvertOptions');
var SUMMARY_FILE = 'SUMMARY.html';

/**
    Write the SUMMARY.html

    @param {Output}
    @return {Output}
*/
function writeSummary(output) {
    var options = output.getOptions();
    var prefix = options.get('prefix');

    var filePath = SUMMARY_FILE;
    var engine = WebsiteGenerator.createTemplateEngine(output, filePath);
    var context = JSONUtils.encodeOutput(output);

    // Render the theme
    return Templating.renderFile(engine, prefix + '/summary.html', context)

    // Write it to the disk
    .then(function(tplOut) {
        return writeFile(output, filePath, tplOut.getContent());
    });
}

/**
    Generate the ebook file as "index.pdf"

    @param {Output}
    @return {Output}
*/
function runEbookConvert(output) {
    var logger = output.getLogger();
    var options = output.getOptions();
    var format = options.get('format');
    var outputFolder = output.getRoot();

    if (!format) {
        return Promise(output);
    }

    return getConvertOptions(output)
    .then(function(options) {
        var cmd = [
            'ebook-convert',
            path.resolve(outputFolder, SUMMARY_FILE),
            path.resolve(outputFolder, 'index.' + format),
            command.optionsToShellArgs(options)
        ].join(' ');

        return command.exec(cmd)
        .progress(function(data) {
            logger.debug(data);
        })
        .fail(function(err) {
            if (err.code == 127) {
                throw error.RequireInstallError({
                    cmd: 'ebook-convert',
                    install: 'Install it from Calibre: https://calibre-ebook.com'
                });
            }

            throw error.EbookError(err);
        });
    })
    .thenResolve(output);
}

/**
    Finish the generation, generates the SUMMARY.html

    @param {Output}
    @return {Output}
*/
function onFinish(output) {
    return writeSummary(output)
    .then(runEbookConvert);
}

module.exports = onFinish;
