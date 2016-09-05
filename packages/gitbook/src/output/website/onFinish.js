const Promise = require('../../utils/promise');
const JSONUtils = require('../../json');
const Templating = require('../../templating');
const writeFile = require('../helper/writeFile');
const createTemplateEngine = require('./createTemplateEngine');

/**
    Finish the generation, write the languages index

    @param {Output}
    @return {Output}
*/
function onFinish(output) {
    const book = output.getBook();
    const options = output.getOptions();
    const prefix = options.get('prefix');

    if (!book.isMultilingual()) {
        return Promise(output);
    }

    const filePath = 'index.html';
    const engine = createTemplateEngine(output, filePath);
    const context = JSONUtils.encodeOutput(output);

    // Render the theme
    return Templating.renderFile(engine, prefix + '/languages.html', context)

    // Write it to the disk
    .then(function(tplOut) {
        return writeFile(output, filePath, tplOut.getContent());
    });
}

module.exports = onFinish;
