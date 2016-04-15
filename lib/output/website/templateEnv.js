var _ = require('lodash');
var nunjucks = require('nunjucks');
var path = require('path');
var fs = require('fs');

var location = require('../../utils/location');
var defaultFilters = require('../../template/filters');

var ThemeLoader = require('./themeLoader');

// Directory for a theme with the templates
function templatesPath(dir) {
    return path.join(dir, '_layouts');
}

/*
    Create and setup at Nunjucks template environment

    @return {Nunjucks.Environment}
*/
function setupTemplateEnv(output, context) {
    var loader = new ThemeLoader(
        _.map(output.searchPaths, templatesPath)
    );
    var env = new nunjucks.Environment(loader);

    // Add context as global
    _.each(context, function(value, key) {
        env.addGlobal(key, value);
    });

    // Add GitBook default filters
    _.each(defaultFilters, function(fn, filter) {
        env.addFilter(filter, fn);
    });

    // Translate using _i18n locales
    env.addFilter('t', function t(s) {
        return output.i18n.t(output.book.config.get('language'), s);
    });

    // Transform an absolute path into a relative path
    // using this.ctx.page.path
    env.addFilter('resolveFile', function resolveFile(href) {
        return location.normalize(output.resolveForPage(context.file.path, href));
    });

    // Test if a file exists
    env.addFilter('fileExists', function fileExists(href) {
        return fs.existsSync(output.resolve(href));
    });

    // Transform a '.md' into a '.html' (README -> index)
    env.addFilter('contentURL', function contentURL(s) {
        return output.toURL(s);
    });

    // Get an article using its path
    env.addFilter('getArticleByPath', function getArticleByPath(s) {
        var article = output.book.summary.getArticle(s);
        if (!article) return undefined;

        return article.getContext();
    });

    // Relase path to an asset
    env.addFilter('resolveAsset', function resolveAsset(href) {
        href = path.join('gitbook', href);

        // Resolve for current file
        if (context.file) {
            href = output.resolveForPage(context.file.path, '/' + href);
        }

        // Use assets from parent
        if (output.book.isLanguageBook()) {
            href = path.join('../', href);
        }

        return location.normalize(href);
    });


    return env;
}

module.exports = setupTemplateEnv;
