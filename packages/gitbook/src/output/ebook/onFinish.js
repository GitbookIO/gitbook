const path = require('path');

const JSONUtils = require('../../json');
const Promise = require('../../utils/promise');
const error = require('../../utils/error');
const command = require('../../utils/command');
const writeFile = require('../helper/writeFile');
const render = require('../../browser/render');

const getConvertOptions = require('./getConvertOptions');
const SUMMARY_FILE = 'SUMMARY.html';

/**
 * Write the SUMMARY.html
 *
 * @param {Output} output
 * @return {Output} output
 */
function writeSummary(output) {
    const plugins = output.getPlugins();

    // Generate initial state
    const initialState = JSONUtils.encodeState(output);

    // Render using React
    const html = render(plugins, initialState, 'ebook', 'ebook:summary');

    return writeFile(output, SUMMARY_FILE, html);
}

/**
 * Generate the ebook file as "index.pdf"
 *
 * @param {Output} output
 * @return {Output} output
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
    .then((options) => {
        const cmd = [
            'ebook-convert',
            path.resolve(outputFolder, SUMMARY_FILE),
            path.resolve(outputFolder, 'index.' + format),
            command.optionsToShellArgs(options)
        ].join(' ');

        return command.exec(cmd)
        .progress((data) => {
            logger.debug(data);
        })
        .fail((err) => {
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
 * Finish the generation, generates the SUMMARY.html
 *
 * @param {Output} output
 * @return {Output} output
 */
function onFinish(output) {
    return writeSummary(output)
    .then(runEbookConvert);
}

module.exports = onFinish;
