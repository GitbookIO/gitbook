var TemplateEngine = require('../../models/templateEngine');

/**
    Create templating engine to render themes

    @param {Output}
    @return {TemplateEngine}
*/
function createTemplateEngine(output) {
    return new TemplateEngine({

    });
}

module.exports = createTemplateEngine;
