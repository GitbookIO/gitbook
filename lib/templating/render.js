var Promise = require('../utils/promise');
var timing = require('../utils/timing');

var replaceShortcuts = require('./replaceShortcuts');

/**
    Render a template

    @param {TemplateEngine} engine
    @param {String} filePath
    @param {String} content
    @param {Object} context
    @return {Promise<String>}
*/
function renderTemplate(engine, filePath, content, context) {
    context = context || {};
    var env = engine.toNunjucks();

    content = replaceShortcuts(engine, filePath, content);

    return timing.measure(
        'template.render',
        Promise.nfcall(
            env.renderString.bind(env),
            content,
            context,
            {
                path: filePath
            }
        )
    );
}

module.exports = renderTemplate;
