const path = require('path');

const WebsiteGenerator = require('../website');
const JSONUtils = require('../../json');
const Templating = require('../../templating');
const Promise = require('../../utils/promise');
const error = require('../../utils/error');
const command = require('../../utils/command');
const writeFile = require('../helper/writeFile');

const getConvertOptions = require('./getConvertOptions');
const SUMMARY_FILE = 'SUMMARY.html';

/**
    Write the SUMMARY.html

    @param {Output}
    @return {Output}
*/
function writeSummary(output) {
    const options = output.getOptions();
    const prefix = options.get('prefix');

    const filePath = SUMMARY_FILE;
    const engine = WebsiteGenerator.createTemplateEngine(output, filePath);
    const context = JSONUtils.encodeOutput(output);

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
    const logger = output.getLogger();
    const options = output.getOptions();
    const format = options.get('format');
    const outputFolder = output.getRoot();

    if (!format) {
        return Promise(output);
    }

    return getConvertOptions(output)
    .then(function(options) {
        const cmd = [
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
