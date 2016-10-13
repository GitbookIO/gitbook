const JSONUtils = require('../../json');
const Modifiers = require('../modifiers');
const writeFile = require('../helper/writeFile');
const getModifiers = require('../getModifiers');
const render = require('../../browser/render');

/**
 * Generate a page using react and the plugins.
 *
 * @param {Output} output
 * @param {Page} page
 */
function onPage(output, page) {
    const file    = page.getFile();
    const plugins = output.getPlugins();
    const urls    = output.getURLIndex();

    // Output file path
    const filePath = urls.resolve(file.getPath());

    return Modifiers.modifyHTML(page, getModifiers(output, page))
    .then(function(resultPage) {
        // Generate the context
        const initialState = JSONUtils.encodeState(output, resultPage);

        // Render the theme
        const html = render(plugins, initialState, 'browser', 'website:body');

        // Write it to the disk
        return writeFile(output, filePath, html);
    });
}

module.exports = onPage;
