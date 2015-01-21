var util = require("util");
var path = require("path");
var Q = require("q");
var _ = require("lodash");

var nunjucks = require("nunjucks");
var ParentExtension = require("nunjucks-parent");
var AutoEscapeExtension = require("nunjucks-autoescape");
var FilterExtension = require("nunjucks-filter");

var fs = require("../utils/fs");
var BaseGenerator = require("../generator");
var links = require("../utils/links");
var pageUtil = require("../utils/page");

var Generator = function() {
    BaseGenerator.apply(this, arguments);

    // revision
    this.revision = new Date();

    // Style to integrates in the output
    this.styles = ["website"];
};
util.inherits(Generator, BaseGenerator);

// Prepare the genertor
Generator.prototype.prepare = function() {
    var that = this;

    return BaseGenerator.prototype.prepare.apply(this)
    .then(function() {
        return that.prepareStyles();
    })
    .then(function() {
        return that.prepareTemplates();
    });
};

// Prepare all styles
Generator.prototype.prepareStyles = function() {
    var that = this;
    this.styles = _.chain(this.styles)
        .map(function(style) {
            var stylePath = that.options.styles[style];
            if (fs.existsSync(path.resolve(that.book.root, stylePath))) {
                return stylePath;
            }
            return null;
        })
        .compact()
        .value();
};

// Prepare template engine
Generator.prototype.prepareTemplates = function() {
	this.pageTemplate = this.plugins.template("site:page") || path.resolve(this.options.theme, 'templates/website/page.html');
    this.langsTemplate = this.plugins.template("site:langs") || path.resolve(this.options.theme, 'templates/website/langs.html');
    this.glossaryTemplate = this.plugins.template("site:glossary") || path.resolve(this.options.theme, 'templates/website/glossary.html');

    var folders = _.chain(
    	[
    		this.pageTemplate, this.langsTemplate, this.glossaryTemplate
	    ])
    	.map(path.dirname)
    	.uniq()
    	.value();

	this.env = new nunjucks.Environment(
		new nunjucks.FileSystemLoader(folders),
		{
			autoescape: true
		}
	);

    // Add filter
    this.env.addFilter("contentLink", this.contentLink.bind(this));
    this.env.addFilter('lvl', function(lvl) {
        return lvl.split(".").length;
    });

    // Add extension
    this.env.addExtension('ParentExtension', new ParentExtension());
    this.env.addExtension('AutoEscapeExtension', new AutoEscapeExtension(this.env));
    this.env.addExtension('FilterExtension', new FilterExtension(this.env));

	return Q();
};

// Ignore some methods
Generator.prototype.transferFile = function(input) {

};

// Finis generation
Generator.prototype.finish = function() {
    return this.copyAssets()
    .then(this.copyCover)
};

// Normalize a link to .html and convert README -> index
Generator.prototype.contentLink = function(link) {
    if (
        path.basename(link) == "README"
        || link == this.book.readmeFile
    ) {
        link = path.join(path.dirname(link), "index"+path.extname(link));
    }

    link = links.changeExtension(link, ".html");
    return link;
}

// Convert an input file
Generator.prototype.writeParsedFile = function(page) {
    var that = this;

    var output = this.contentLink(page.path);
    output = path.join(that.options.output, output);

    var basePath = path.relative(path.dirname(output), this.options.output) || ".";
    if (process.platform === 'win32') basePath = basePath.replace(/\\/g, '/');

    return that.normalizePage(page)
    .then(function() {
        return that._writeTemplate(that.pageTemplate, {
            progress: page.progress,

            _input: page.path,
            content: page.sections,

            basePath: basePath,
            staticBase: links.join(basePath, "gitbook")
        }, output);
    });
};

// Write the index for langs
Generator.prototype.langsIndex = function(langs) {

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
        return _callHook("page");
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
    .then(function(sections) {
    	return that.env.render(
    		tpl,
    		_.extend({
	            styles: that.styles,

	            revision: that.revision,

	            title: that.options.title,
	            description: that.options.description,

	            glossary: that.book.glossary,

	            summary: that.book.summary,
	            allNavigation: that.book.navigation,

	            plugins: that.plugins,
	            pluginsConfig: JSON.stringify(that.options.pluginsConfig),
	            htmlSnippet: _.partialRight(that.plugins.html, that, options),

	            options: that.options
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
        path.join(that.options.theme, "assets"),
        path.join(that.options.output, "gitbook")
    )

    // Copy plugins assets
    .then(function() {
        return Q.all(
            _.map(that.plugins.list, function(plugin) {
                var pluginAssets = path.join(that.options.output, "gitbook/plugins/", plugin.name);
                return plugin.copyAssets(pluginAssets, {
                    base: that.pluginAssetsBase
                });
            })
        );
    });
};

module.exports = Generator;
