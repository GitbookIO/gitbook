const Plugins = require('../../plugins');
const JSONUtils = require('../../json');
const Modifiers = require('../modifiers');
const writeFile = require('../helper/writeFile');
const fileToOutput = require('../helper/fileToOutput');
const getModifiers = require('../getModifiers');
const render = require('../../browser/render');

/**
 * Write a page as a json file
 *
 * @param {Output} output
 * @param {Page} page
 */
function onPage(output, page) {
    const file      = page.getFile();
    const plugins   = output.getPlugins();
    const state     = output.getState();
    const resources = state.getResources();

    // Output file path
    const filePath = fileToOutput(output, file.getPath());

    return Modifiers.modifyHTML(page, getModifiers(output, page))
    .then(function(resultPage) {
        // Generate the context
        const initialState = JSONUtils.encodeOutputWithPage(output, resultPage);
        initialState.plugins = {
            resources: Plugins.listResources(plugins, resources).toJS()
        };

        // Render the theme
        const html = render(plugins, initialState);

        // Write it to the disk
        return writeFile(output, filePath, html);
    });
}

module.exports = onPage;
