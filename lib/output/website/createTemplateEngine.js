var path = require('path');
var nunjucks = require('nunjucks');
var DoExtension = require('nunjucks-do')(nunjucks);

var Api = require('../../api');
var deprecate = require('../../api/deprecate');
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
 * Directory for a theme with the templates
 */
function templateFolder(dir) {
    return path.join(dir, templatesFolder);
}

/**
 * Create templating engine to render themes
 *
 * @param {Output} output
 * @param {String} currentFile
 * @return {TemplateEngine}
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
    var language = config.getValue('language');

    // Create API context
    var context = Api.encodeGlobal(output);


    /**
     * Check if a file exists
     * @param {String} fileName
     * @return {Boolean}
     */
    function fileExists(fileName) {
        if (!fileName) {
            return false;
        }

        var filePath = PathUtils.resolveInRoot(outputFolder, fileName);
        return fs.existsSync(filePath);
    }

    /**
     * Return an article by its path
     * @param {String} filePath
     * @return {Object|undefined}
     */
    function getArticleByPath(filePath) {
        var article = summary.getByPath(filePath);
        if (!article) return undefined;

        return JSONUtils.encodeSummaryArticle(article);
    }

    /**
     * Return a page by its path
     * @param {String} filePath
     * @return {Object|undefined}
     */
    function getPageByPath(filePath) {
        var page = output.getPage(filePath);
        if (!page) return undefined;

        return JSONUtils.encodePage(page, summary);
    }

    return TemplateEngine.create({
        loader: loader,

        context: context,

        globals: {
            getArticleByPath: getArticleByPath,
            getPageByPath: getPageByPath,
            fileExists: fileExists
        },

        filters: defaultFilters.merge({
            /**
             * Translate a sentence
             */
            t: function t(s) {
                return i18n.t(language, s);
            },

            /**
             * Resolve an absolute file path into a
             * relative path.
             * it also resolve pages
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


            fileExists: deprecate.method(book, 'fileExists', fileExists, 'Filter "fileExists" is deprecated, use "fileExists(filename)" '),
            getArticleByPath: deprecate.method(book, 'getArticleByPath', fileExists, 'Filter "getArticleByPath" is deprecated, use "getArticleByPath(filename)" '),

            contentURL: function(filePath) {
                return fileToURL(output, filePath);
            }
        }),

        extensions: {
            'DoExtension': new DoExtension()
        }
    });
}

module.exports = createTemplateEngine;
