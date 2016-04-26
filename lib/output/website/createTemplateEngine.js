var path = require('path');
var nunjucks = require('nunjucks');
var DoExtension = require('nunjucks-do')(nunjucks);

var JSONUtils = require('../../json');
var LocationUtils = require('../../utils/location');
var TemplateEngine = require('../../models/templateEngine');
var templatesFolder = require('../../constants/templatesFolder');
var defaultFilters = require('../../constants/defaultFilters');
var Templating = require('../../templating');
var listSearchPaths = require('./listSearchPaths');

/**
    Directory for a theme with the templates
*/
function templateFolder(dir) {
    return path.join(dir, templatesFolder);
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
    var summary = book.getSummary();

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
            /**
                Translate a sentence
            */
            t: function t(s) {
                return i18n.t(language, s);
            },

            /**
                Resolve an absolute file path into a
                relative path
            */
            resolveFile: function(s) {
                // Convert /test.png -> test.png
                s = LocationUtils.toAbsolute(s, '', '');

                // Convert to relative
                s = LocationUtils.relative(
                    this.resolve('.') + '/',
                    this.book.resolve(name)
                );

                return LocationUtils.normalize(s);
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

            /**
                Return an article by its path
            */
            getArticleByPath: function(s) {
                var article = summary.getByPath(s);
                if (!article) return undefined;
                return JSONUtils.encodeSummaryArticle(article);
            }
        }),

        extensions: {
            'DoExtension': new DoExtension()
        }
    });
}

module.exports = createTemplateEngine;
