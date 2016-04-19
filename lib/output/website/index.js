var _ = require('lodash');
var path = require('path');
var util = require('util');
var I18n = require('i18n-t');

var Promise = require('../../utils/promise');
var location = require('../../utils/location');
var fs = require('../../utils/fs');
var conrefsLoader = require('../conrefs');
var Output = require('../base');
var setupTemplateEnv = require('./templateEnv');

function _WebsiteOutput() {
    Output.apply(this, arguments);

    // Nunjucks environment
    this.env;

    // Plugin instance for the main theme
    this.theme;

    // Plugin instance for the default theme
    this.defaultTheme;

    // Resources loaded from plugins
    this.resources;

    // i18n for themes
    this.i18n = new I18n();
}
util.inherits(_WebsiteOutput, Output);

var WebsiteOutput = conrefsLoader(_WebsiteOutput);

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
        // This list is ordered to give priority to templates in the book
        var searchPaths = _.pluck(that.plugins.list(), 'root');

        // The book itself can contains a "_layouts" folder
        searchPaths.unshift(that.book.root);

        // Load i18n
        _.each(searchPaths.concat().reverse(), function(searchPath) {
            var i18nRoot = path.resolve(searchPath, '_i18n');

            if (!fs.existsSync(i18nRoot)) return;
            that.i18n.load(i18nRoot);
        });

        that.searchPaths = searchPaths;
    })

    // Copy assets from themes before copying files from book
    .then(function() {
        if (that.book.isLanguageBook()) return;

        // Assets from the book are already copied
        // Copy assets from plugins (start with default plugins)
        return Promise.serie(that.plugins.list().reverse(), function(plugin) {
            // Copy assets only if exists (don't fail otherwise)
            var assetFolder = path.join(plugin.root, '_assets', that.name);
            if (!fs.existsSync(assetFolder)) return;

            that.log.debug.ln('copy assets from theme', assetFolder);
            return fs.copyDir(
                assetFolder,
                that.resolve('gitbook'),
                {
                    deleteFirst: false,
                    overwrite: true,
                    confirm: true
                }
            );
        });
    })

    // Load resources for plugins
    .then(function() {
        return that.plugins.getResources(that.name)
        .then(function(resources) {
            that.resources = resources;
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
        return that.render('page', that.outputPath(page.path), page.getOutputContext(that));
    });
};

// Finish generation, create ebook using ebook-convert
WebsiteOutput.prototype.finish = function() {
    var that = this;

    return Promise()
    .then(function() {
        return WebsiteOutput.super_.prototype.finish.apply(that);
    })

    // Copy assets from plugins
    .then(function() {
        if (that.book.isLanguageBook()) return;
        return that.plugins.copyResources(that.name, that.resolve('gitbook'));
    })

    // Generate homepage to select languages
    .then(function() {
        if (!that.book.isMultilingual()) return;
        return that.outputMultilingualIndex();
    });
};

// ----- Utilities ----

// Write multi-languages index
WebsiteOutput.prototype.outputMultilingualIndex = function() {
    var that = this;

    return that.render('languages', 'index.html', that.getContext());
};

/*
    Render a template as an HTML string
    Templates are stored in `_layouts` folders


    @param {String} tpl: template name (ex: "page")
    @param {String} outputFile: filename to write, relative to the output
    @param {Object} context: context for the page
    @return {Promise}
*/
WebsiteOutput.prototype.renderAsString = function(tpl, context) {
    // Calcul template name
    var filename = this.templateName(tpl);

    context = _.extend({
        template: {}
    }, context, {
        plugins: {
            resources: this.resources
        },

        options: this.opts
    });

    // Create environment
    var env = setupTemplateEnv(this, context);

    return Promise.nfcall(env.render.bind(env), filename);
};

/*
    Render a template using nunjucks
    Templates are stored in `_layouts` folders


    @param {String} tpl: template name (ex: "page")
    @param {String} outputFile: filename to write, relative to the output
    @param {Object} context: context for the page
    @return {Promise}
*/
WebsiteOutput.prototype.render = function(tpl, outputFile, context) {
    var that = this;

    // Calcul relative path to the root
    var outputDirName = path.dirname(outputFile);
    var basePath = location.normalize(path.relative(outputDirName, './'));

    // Setup complete context
    context = _.extend(context, {
        basePath: basePath,

        template: {
            getJSContext: function() {
                return {
                    page: _.omit(context.page, 'content'),
                    config: context.config,
                    file: context.file,
                    gitbook: context.gitbook,
                    basePath: basePath,
                    book: {
                        language: context.book.language
                    }
                };
            }
        }
    });

    return this.renderAsString(tpl, context)
    .then(function(html) {
        return that.writeFile(
            outputFile,
            html
        );
    });
};

// Return a complete name for a template
WebsiteOutput.prototype.templateName = function(name) {
    return path.join(this.name, name+'.html');
};

module.exports = WebsiteOutput;



