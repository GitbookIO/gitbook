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

    // Style to integrates i nthe output
    this.styles = ["website"];

    // base folder for templates
    this.templatesRoot = path.resolve(__dirname, "../../theme/templates/website")
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
	this.pageTemplate = this.plugins.template("site:page") || path.resolve(this.templatesRoot, 'page.html');
    this.langsTemplate = this.plugins.template("site:langs") || path.resolve(this.templatesRoot, 'langs.html');
    this.glossaryTemplate = this.plugins.template("site:glossary") || path.resolve(this.templatesRoot, 'glossary.html');

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

    // Add extension
    this.env.addExtension('ParentExtension', new ParentExtension());
    this.env.addExtension('AutoEscapeExtension', new AutoEscapeExtension(this.env));
    this.env.addExtension('FilterExtension', new FilterExtension(this.env));

	return Q();
};

// Ignore some methods
Generator.prototype.transferFile = function(input) {

};


Generator.prototype.finish = function() {

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

    return that.normalizePage(page)
    .then(function() {
        return that._writeTemplate(that.pageTemplate, {

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

	            glossary: that.options.glossary,

	            summary: that.options.summary,
	            allNavigation: that.options.navigation,

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

module.exports = Generator;
