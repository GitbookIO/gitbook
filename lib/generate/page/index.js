var _ = require("lodash");
var util = require("util");
var path = require("path");
var Q = require("q");
var swig = require("../template");

var fs = require("../fs");
var parse = require("../../parse");
var BaseGenerator = require("../site");


/*
 *  This generator will generate a simple index.html which can be converted as a PDF
 */
var Generator = function() {
    BaseGenerator.apply(this, arguments);

    // Base for assets in plugins
    this.pluginAssetsBase = "ebook";

    // List of pages content
    this.pages = {};
};
util.inherits(Generator, BaseGenerator);

// Load all templates
Generator.prototype.loadTemplates = function() {
    this.template = swig.compileFile(
        this.plugins.template("page") || path.resolve(this.options.theme, 'templates/page.html')
    );
};

Generator.prototype.convertFile = function(content, input) {
    var that = this;
    var json = {
        path: input,
        progress: parse.progress(this.options.navigation, input)
    };

    return this.prepareFile(content, input)
    .then(function(page) {
        that.pages[input] = page;
    });
};

// Generate languages index
Generator.prototype.langsIndex = function(langs) {
    return Q();
};

Generator.prototype.finish = function() {
    var that = this;
    var basePath = ".";
    var output = path.join(this.options.output, "index.html");

    var progress = parse.progress(this.options.navigation, "README.md");

    return Q()
    // Generate html
    .then(function(pages) {
        return that._writeTemplate(that.template, {
            pages: that.pages,
            progress: progress,

            basePath: basePath,
            staticBase: path.join(basePath, "gitbook"),
        }, output);
    })

    // Copy cover
    .then(function() {
        return that.copyCover();
    })

    // Copy assets
    .then(function() {
        return that.copyAssets();
    });
};

module.exports = Generator;