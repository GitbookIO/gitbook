var Templating = require('../../templating');
var TemplateEngine = require('../../models/templateEngine');
var listSearchPaths = require('./listSearchPaths');

/**
    Create templating engine to render themes

    @param {Output}
    @return {TemplateEngine}
*/
function createTemplateEngine(output) {
    var searchPaths = listSearchPaths(output);
    var loader = new Templating.ThemesLoader(searchPaths);

    return new TemplateEngine({
        loader: loader
    });
}

module.exports = createTemplateEngine;
