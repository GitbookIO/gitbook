var path = require('path');
var nunjucks = require('nunjucks');
var DoExtension = require('nunjucks-do')(nunjucks);

var Api = require('../../api');
var JSONUtils = require('../../json');
var LocationUtils = require('../../utils/location');
var fs = require('../../utils/fs');
var PathUtils = require('../../utils/path');
var TemplateEngine = require('../../models/templateEngine');
var templatesFolder = require('../../constants/templatesFolder');
var defaultFilters = require('../../constants/defaultFilters');
var Templating = require('../../templating');
var listSearchPaths = require('./listSearchPaths');

var fileToURL = require('../helper/fileToURL');
var resolveFileToURL = require('../helper/resolveFileToURL');

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
    var outputFolder = output.getRoot();

    // Search paths for templates
    var searchPaths = listSearchPaths(output);
    var tplSearchPaths = searchPaths.map(templateFolder);

    // Create loader
    var loader = new Templating.ThemesLoader(tplSearchPaths);

    // Get languages
    var language = config.get('language');

    // Create API context
    var context = Api.encodeGlobal(output);

    return TemplateEngine.create({
        loader: loader,

        context: context,

        filters: defaultFilters.merge({
            /**
                Translate a sentence
            */
            t: function t(s) {
                return i18n.t(language, s);
            },

            /**
                Resolve an absolute file path into a
                relative path.
                it also resolve pages
            */
            resolveFile: function(filePath) {
                filePath = resolveFileToURL(output, filePath);
                return LocationUtils.relativeForFile(currentFile, filePath);
            },

            resolveAsset: function(filePath) {
                filePath = LocationUtils.toAbsolute(filePath, '', '');
                filePath = path.join('gitbook', filePath);
                filePath = LocationUtils.relativeForFile(currentFile, filePath);

                // Use assets from parent if language book
                if (book.isLanguageBook()) {
                    filePath = path.join('../', filePath);
                }

                return LocationUtils.normalize(filePath);
            },

            /**
                Check if a file exists
            */
            fileExists: function(fileName) {
                var filePath = PathUtils.resolveInRoot(outputFolder, fileName);
                return fs.existsSync(filePath);
            },

            contentURL: function(filePath) {
                return fileToURL(output, filePath);
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
