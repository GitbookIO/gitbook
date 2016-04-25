var path = require('path');

var TEMPLATES_FOLDER = require('../../constants/templatesFolder');

var Templating = require('../../templating');
var TemplateEngine = require('../../models/templateEngine');
var listSearchPaths = require('./listSearchPaths');

/**
    Directory for a theme with the templates
*/
function templateFolder(dir) {
    return path.join(dir, TEMPLATES_FOLDER);
}

/**
    Create templating engine to render themes

    @param {Output}
    @return {TemplateEngine}
*/
function createTemplateEngine(output) {
    var searchPaths = listSearchPaths(output);

    // Search paths for templates
    var tplSearchPaths = searchPaths.map(templateFolder);

    var loader = new Templating.ThemesLoader(tplSearchPaths);

    return new TemplateEngine({
        loader: loader
    });
}

module.exports = createTemplateEngine;
