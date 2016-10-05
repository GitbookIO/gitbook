const JSONUtils = require('../../json');
const Modifiers = require('../modifiers');
const writeFile = require('../helper/writeFile');
const fileToOutput = require('../helper/fileToOutput');
const getModifiers = require('../getModifiers');
const render = require('../../browser/render');

/**
 * Generate a page using react and the plugins.
 *
 * @param {Output} output
 * @param {Page} page
 */
function onPage(output, page) {
    const file      = page.getFile();
    const plugins   = output.getPlugins();

    // Output file path
    const filePath = fileToOutput(output, file.getPath());

    return Modifiers.modifyHTML(page, getModifiers(output, page))
    .then(function(resultPage) {
        // Generate the context
        const initialState = JSONUtils.encodeOutputWithPage(output, resultPage);

        // Render the theme
        const html = render(plugins, initialState);

        // Write it to the disk
        return writeFile(output, filePath, html);
    });
}

module.exports = onPage;
