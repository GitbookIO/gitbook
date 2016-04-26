var path = require('path');
var nunjucks = require('nunjucks');
var DoExtension = require('nunjucks-do')(nunjucks);

var TEMPLATES_FOLDER = require('../../constants/templatesFolder');

var Templating = require('../../templating');
var TemplateEngine = require('../../models/templateEngine');
var defaultFilters = require('../../constants/defaultFilters');
var listSearchPaths = require('./listSearchPaths');

/**
    Directory for a theme with the templates
*/
function templateFolder(dir) {
    return path.join(dir, TEMPLATES_FOLDER);
}

/**
    Create templating engine to render themes

    @param {Output} output
    @param {String} currentFile
    @return {TemplateEngine}
*/
function createTemplateEngine(output, currentFile) {
    var book = output.getBook();
    var state = output.getState();
    var i18n = state.getI18n();
    var config = book.getConfig();

    // Search paths for templates
    var searchPaths = listSearchPaths(output);
    var tplSearchPaths = searchPaths.map(templateFolder);

    // Create loader
    var loader = new Templating.ThemesLoader(tplSearchPaths);

    // Get languages
    var language = config.get('language');

    return TemplateEngine.create({
        loader: loader,

        filters: defaultFilters.merge({
            t: function(s) {
                return i18n.t(language, s);
            },
            resolveFile: function(s) {
                return s;
            },
            resolveAsset: function(s) {
                return s;
            },
            fileExists: function() {
                return false;
            },
            contentURL: function(s) {
                return s;
            },
            getArticleByPath: function(s) {
                return undefined;
            }
        }),

        extensions: {
            'DoExtension': new DoExtension()
        }
    });
}

module.exports = createTemplateEngine;
