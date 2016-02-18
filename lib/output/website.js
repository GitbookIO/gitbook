var _ = require('lodash');
var path = require('path');
var util = require('util');
var nunjucks = require('nunjucks');

var Promise = require('../utils/promise');
var conrefsLoader = require('./conrefs');
var Output = require('./base');

// Tranform a theme ID into a plugin
function themeID(plugin) {
    return 'theme-' + plugin;
}

// Directory for a theme with the templates
function templatesPath(dir) {
    return path.join(dir, '_layouts');
}

function WebsiteOutput() {
    Output.apply(this, arguments);

    // Nunjucks environment
    this.env;

    // Plugin instance for the main theme
    this.theme;

    // Plugin instance for the default theme
    this.defaultTheme;
}
util.inherits(WebsiteOutput, Output);

// Name of the generator
// It's being used as a prefix for templates
WebsiteOutput.prototype.name = 'website';

// Load and setup the theme
WebsiteOutput.prototype.prepare = function() {
    var that = this;

    return Promise()
    .then(function() {
        return WebsiteOutput.super_.prototype.prepare.apply(that);
    })

    .then(function() {
        var themeName = that.book.config.get('theme');
        that.theme = that.plugins.get(themeID(themeName));
        that.themeDefault = that.plugins.get(themeID('default'));

        if (!that.theme) {
            throw new Error('Theme "' + themeName + '" is not installed, add "' + themeID(themeName) + '" to your "book.json"');
        }

        var searchPaths = _.chain([
            // The book itself can contains a "_layouts" folder
            '_layouts',

            // Installed plugin (it can be identical to themeDefault.root)
            '_layouts',

            // Is default theme still installed
            that.themeDefault? that.themeDefault.root : null
        ])
        .compact()
        .map(templatesPath)
        .uniq()
        .value();

        that.env = new nunjucks.Environment(new nunjucks.FileSystemLoader(searchPaths));

        that.env.addGlobal('__', function(s) {
            // todo: i18n
            return s;
        });

        // Transform an absolute path into a relative path
        // using this.ctx.page.path
        that.env.addFilter('resolveFile', function(href) {
            return that.resolveForPage(this.ctx.file.path, href);
        });

        // Transform a '.md' into a '.html' (README -> index)
        that.env.addFilter('contentURL', function(s) {
            return that.onRelativeLink(null, s);
        });

        // Relase path to an asset
        that.env.addFilter('resolveAsset', function(href) {
            href = path.join('/gitbook', href);
            return that.resolveForPage(this.ctx.file.path, href);
        });
    });
};

// Write a page (parsable file)
WebsiteOutput.prototype.onPage = function(page) {
    var that = this;

    // Parse the page
    return page.toHTML(this)

    // Render the page template with the same context as the json output
    .then(function() {
        return that.render('page', that.getPageContext(page));
    })

    // Write the HTML file
    .then(function(html) {
        return that.writeFile(
            that.outputPath(page.path),
            html
        );
    });
};

// ----- Utilities ----

// Render a template using nunjucks
// Templates are stored in `_layouts` folders
WebsiteOutput.prototype.render = function(tpl, context) {
    return Promise.nfcall(this.env.render.bind(this.env), this.templateName(tpl), context);
};

// Return a complete name for a template
WebsiteOutput.prototype.templateName = function(name) {
    return path.join(this.name, name+'.html');
};

module.exports = conrefsLoader(WebsiteOutput);
