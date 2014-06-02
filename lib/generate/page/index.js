var _ = require("lodash");
var util = require("util");
var path = require("path");
var Q = require("q");
var swig = require('swig');
var hljs = require('highlight.js');

var fs = require("../fs");
var parse = require("../../parse");
var BaseGenerator = require("../site");

// Swig filter: highlight coloration
swig.setFilter('code', function(code, lang) {
    try {
        return hljs.highlight(lang, code).value;
    } catch(e) {
        return hljs.highlightAuto(code).value;
    }
});

// Convert a level into a deep level
swig.setFilter('lvl', function(lvl) {
    return lvl.split(".").length;
});


/*
 *  This generator will generate a simple index.html which can be converted as a PDF
 */
var Generator = function() {
    BaseGenerator.apply(this, arguments);

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

    return Q()
    .then(function() {
        return parse.page(content, {
            repo: that.options.githubId,
            dir: path.dirname(input) || '/',
            outdir: './',
            singleFile: true
        });
    })
    .then(function(sections) {
        json.content = sections;
    })
    .then(function() {
        that.pages[input] = json;
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

    // Copy assets
    .then(function() {
        return fs.copy(
            path.join(that.options.theme, "assets"),
            path.join(that.options.output, "gitbook")
        );
    });
};

module.exports = Generator;