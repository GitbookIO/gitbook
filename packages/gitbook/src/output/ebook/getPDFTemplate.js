const juice = require('juice');

const JSONUtils = require('../../json');
const render = require('../../browser/render');
const Promise = require('../../utils/promise');

/**
 * Generate PDF header/footer templates
 *
 * @param {Output} output
 * @param {String} type ("footer" or "header")
 * @return {String} html
 */
function getPDFTemplate(output, type) {
    const outputRoot = output.getRoot();
    const plugins = output.getPlugins();

    // Generate initial state
    const initialState = JSONUtils.encodeState(output);
    initialState.page = {
        num: '_PAGENUM_',
        title: '_SECTION_'
    };

    // Render the theme
    const html = render(plugins, initialState, 'ebook', `pdf:${type}`);

    // Inline CSS
    return Promise.nfcall(juice.juiceResources, html, {
        webResources: {
            relativeTo: outputRoot
        }
    });
}

module.exports = getPDFTemplate;
