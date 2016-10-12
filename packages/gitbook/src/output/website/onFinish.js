const JSONUtils = require('../../json');
const Promise = require('../../utils/promise');
const writeFile = require('../helper/writeFile');
const render = require('../../browser/render');

/**
 * Finish the generation, write the languages index.
 *
 * @param {Output}
 * @return {Output}
 */
function onFinish(output) {
    const book = output.getBook();

    if (!book.isMultilingual()) {
        return Promise(output);
    }

    const plugins = output.getPlugins();

    // Generate initial state
    const initialState = JSONUtils.encodeState(output);

    // Render using React
    const html = render(plugins, initialState, 'browser', 'website:languages');

    return writeFile(output, 'index.html', html);
}

module.exports = onFinish;
