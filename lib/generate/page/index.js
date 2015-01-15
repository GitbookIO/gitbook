var _ = require("lodash");
var util = require("util");
var path = require("path");
var Q = require("q");
var swig = require("../template");

var fs = require("../fs");
var parse = require("../../parse");
var BaseGenerator = require("../site");

var Generator = function() {
    BaseGenerator.apply(this, arguments);

    // Styles to use
    this.styles = ["ebook"];

    // Base for assets in plugins
    this.pluginAssetsBase = "ebook";

    // List of pages content
    this.pages = {};
};
util.inherits(Generator, BaseGenerator);

Generator.prototype.loadTemplates = function() {
    this.template = swig.compileFile(
        this.plugins.template("ebook:page") || path.resolve(this.options.theme, 'templates/ebook/page.html')
    );
    this.summaryTemplate = swig.compileFile(
        this.plugins.template("ebook:sumary") || path.resolve(this.options.theme, 'templates/ebook/summary.html')
    );
    this.glossaryTemplate = swig.compileFile(
        this.plugins.template("ebook:glossary") || path.resolve(this.options.theme, 'templates/ebook/glossary.html')
    );
};

// Generate table of contents
Generator.prototype.writeToc = function() {
    var that = this;
    var basePath = ".";

    return this._writeTemplate(this.summaryTemplate, {
        toc: parse.progress(this.options.navigation, "README.md").chapters,
        basePath: basePath,
        staticBase: path.join(basePath, "gitbook"),
    }, path.join(this.options.output, "SUMMARY.html"));
};

Generator.prototype.finish = function() {
    var that = this;
    var basePath = ".";
    var output = path.join(this.options.output, "index.html");

    var progress = parse.progress(this.options.navigation, "README.md");

    return Q()

    // Write table of contents
    .then(function() {
        return that.writeToc();
    })

    // Write glossary
    .then(function() {
        return that.writeGlossary();
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

// Generate languages index
Generator.prototype.langsIndex = function(langs) {
    return Q();
};

module.exports = Generator;
