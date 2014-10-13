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

Generator.prototype.finish = function() {
    var that = this;
    var basePath = ".";
    var output = path.join(this.options.output, "index.html");

    var progress = parse.progress(this.options.navigation, "README.md");

    return Q()

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
