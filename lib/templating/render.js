var Promise = require('../utils/promise');

var replaceShortcuts = require('./replaceShortcuts');

/**
    Render a template

    @param {TemplateEngine} engine
    @param {String} filePath
    @param {String} content
    @param {Object} ctx
    @return {Promise<String>}
*/
function renderTemplate(engine, filePath, content, context) {
    context = context || {};
    var env = engine.toNunjucks();

    content = replaceShortcuts(engine, filePath, content);

    return Promise.nfcall(
        env.renderString.bind(env),
        content,
        context,
        {
            path: filePath
        }
    );
}

module.exports = renderTemplate;
