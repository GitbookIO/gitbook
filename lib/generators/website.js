var util = require('util');
var path = require('path');
var Q = require('q');
var _ = require('lodash');

var nunjucks = require('nunjucks');
var AutoEscapeExtension = require('nunjucks-autoescape')(nunjucks);
var FilterExtension = require('nunjucks-filter')(nunjucks);

var fs = require('../utils/fs');
var BaseGenerator = require('../generator');
var links = require('../utils/links');
var i18n = require('../utils/i18n');

var pkg = require('../../package.json');

var Generator = function() {
    BaseGenerator.apply(this, arguments);

    // Revision
    this.revision = new Date();

    // Resources namespace
    this.namespace = 'website';

    // Style to integrates in the output
    this.styles = ['website'];

    // Convert images (svg -> png)
    this.convertImages = false;

    // Templates
    this.templates = {};
};
util.inherits(Generator, BaseGenerator);

// Prepare the genertor
Generator.prototype.prepare = function() {
    return BaseGenerator.prototype.prepare.apply(this)
    .then(this.prepareStyles)
    .then(this.prepareTemplates)
    .then(this.prepareTemplateEngine);
};

// Prepare all styles
Generator.prototype.prepareStyles = function() {
    var that = this;

    this.styles = _.chain(this.styles)
        .map(function(style) {
            var stylePath = that.options.styles[style];
            var styleExists = (
                fs.existsSync(that.book.resolveOutput(stylePath)) ||
                fs.existsSync(that.book.resolve(stylePath))
            );

            if (stylePath && styleExists) {
                return [style, stylePath];
            }
            return null;
        })
        .compact()
        .object()
        .value();

    return Q();
};

// Prepare templates
Generator.prototype.prepareTemplates = function() {
    this.templates.page = this.book.plugins.template('site:page') || path.resolve(this.options.theme, 'templates/website/page.html');
    this.templates.langs = this.book.plugins.template('site:langs') || path.resolve(this.options.theme, 'templates/website/langs.html');
    this.templates.glossary = this.book.plugins.template('site:glossary') || path.resolve(this.options.theme, 'templates/website/glossary.html');

    return Q();
};

// Prepare template engine
Generator.prototype.prepareTemplateEngine = function() {
    var that = this;

    return Q()
    .then(function() {
        var language = that.book.config.normalizeLanguage();

        if (!i18n.hasLocale(language)) {
            that.book.log.warn.ln('Language "'+language+'" is not available as a layout locales (en, '+i18n.getLocales().join(', ')+')');
        }

        var folders = _.chain(that.templates)
            .values()
            .map(path.dirname)
            .uniq()
            .value();

        that.env = new nunjucks.Environment(
            new nunjucks.FileSystemLoader(folders),
            {
                autoescape: true
            }
        );

        // Add filter
        that.env.addFilter('contentLink', that.book.contentLink.bind(that.book));
        that.env.addFilter('lvl', function(lvl) {
            return lvl.split('.').length;
        });

        // Add extension
        that.env.addExtension('AutoEscapeExtension', new AutoEscapeExtension(that.env));
        that.env.addExtension('FilterExtension', new FilterExtension(that.env));
    });
};

// Finis generation
Generator.prototype.finish = function() {
    return this.copyAssets()
    .then(this.copyCover)
    .then(this.writeGlossary)
    .then(this.writeLangsIndex);
};

// Convert an input file
Generator.prototype.convertFile = function(input) {
    var that = this;

    return that.book.parsePage(input, {
        convertImages: that.convertImages,
        interpolateTemplate: function(page) {
            return that.callHook('page:before', page);
        },
        interpolateContent: function(page) {
            return that.callHook('page', page);
        }
    })
    .then(function(page) {
        var relativeOutput = that.book.contentPath(page.path);
        var output = path.join(that.options.output, relativeOutput);

        var basePath = path.relative(path.dirname(output), that.options.output) || '.';
        if (process.platform === 'win32') basePath = basePath.replace(/\\/g, '/');

        that.book.log.debug.ln('write parsed file', page.path, 'to', relativeOutput);

        return that._writeTemplate(that.templates.page, {
            progress: page.progress,

            _input: page.path,
            content: page.sections,

            basePath: basePath,
            staticBase: links.join(basePath, 'gitbook')
        }, output);
    });
};

// Write the index for langs
Generator.prototype.writeLangsIndex = function() {
    if (!this.book.langs.length) return Q();

    return this._writeTemplate(this.templates.langs, {
        langs: this.book.langs
    }, path.join(this.options.output, 'index.html'));
};

// Write glossary
Generator.prototype.writeGlossary = function() {
    // No glossary
    if (this.book.glossary.length === 0) return Q();

    return this._writeTemplate(this.templates.glossary, {}, path.join(this.options.output, 'GLOSSARY.html'));
};

// Convert a page into a normalized data set
Generator.prototype.normalizePage  = function(page) {
    var that = this;

    var _callHook = function(name) {
        return that.callHook(name, page)
        .then(function(_page) {
            page = _page;
            return page;
        });
    };

    return Q()
    .then(function() {
        return _callHook('page');
    })
    .then(function() {
        return page;
    });
};

// Generate a template
Generator.prototype._writeTemplate = function(tpl, options, output, interpolate) {
    var that = this;

    interpolate = interpolate || _.identity;
    return Q()
    .then(function() {
        return that.env.render(
            tpl,
            _.extend({
                gitbook: {
                    version: pkg.version
                },

                styles: that.styles,

                revision: that.revision,

                title: that.options.title,
                description: that.options.description,
                language: that.book.config.normalizeLanguage(),
                innerlanguage: that.book.isSubBook()? that.book.config.get('language') : null,

                glossary: that.book.glossary,

                summary: that.book.summary,
                allNavigation: that.book.navigation,

                plugins: {
                    resources: that.book.plugins.resources(that.namespace)
                },
                pluginsConfig: JSON.stringify(that.options.pluginsConfig),
                htmlSnippet: _.partial(_.partialRight(that.book.plugins.html, that, options), that.namespace),

                options: that.options,

                basePath: '.',
                staticBase: path.join('.', 'gitbook'),

                '__': that.book.i18n.bind(that.book)
            }, options)
        );
    })
    .then(interpolate)
    .then(function(html) {
        return fs.writeFile(
            output,
            html
        );
    });
};

// Copy assets
Generator.prototype.copyAssets = function() {
    var that = this;

    // Copy gitbook assets
    return fs.copy(
        path.join(that.options.theme, 'assets/'+this.namespace),
        path.join(that.options.output, 'gitbook')
    )

    // Copy plugins assets
    .then(function() {
        return Q.all(
            _.map(that.book.plugins.list, function(plugin) {
                var pluginAssets = path.join(that.options.output, 'gitbook/plugins/', plugin.name);
                return plugin.copyAssets(pluginAssets, that.namespace);
            })
        );
    });
};

module.exports = Generator;
