var path = require('path');
var nunjucks = require('nunjucks');
var DoExtension = require('nunjucks-do')(nunjucks);

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

    @param {Output} output
    @param {String} currentFile
    @return {TemplateEngine}
*/
function createTemplateEngine(output, currentFile) {
    var searchPaths = listSearchPaths(output);

    // Search paths for templates
    var tplSearchPaths = searchPaths.map(templateFolder);

    var loader = new Templating.ThemesLoader(tplSearchPaths);

    return TemplateEngine.create({
        loader: loader,

        filters: {
            t: function(s) {
                return s;
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
        },

        extensions: {
            'DoExtension': new DoExtension()
        }
    });
}

module.exports = createTemplateEngine;
