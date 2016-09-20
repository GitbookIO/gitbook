const path = require('path');

const Plugins = require('../../plugins');
const JSONUtils = require('../../json');
const LocationUtils = require('../../utils/location');
const Modifiers = require('../modifiers');
const writeFile = require('../helper/writeFile');
const fileToOutput = require('../helper/fileToOutput');
const getModifiers = require('../getModifiers');
const createTemplateEngine = require('./createTemplateEngine');
const render = require('../../browser/render');
const loadBrowserPlugins = require('../../browser/loadPlugins');

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

        // We should probabbly move it to "template" or a "site" namespace
        // context.basePath = basePath;

        // Load the plugins
        const browserPlugins = loadBrowserPlugins(plugins);

        // Render the theme
        const html = render(browserPlugins, initialState);

        // Write it to the disk
        return writeFile(output, filePath, html);
    });
}

module.exports = onPage;
