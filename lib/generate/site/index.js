var util = require("util");
var path = require("path");
var Q = require("q");
var _ = require("lodash");
var swig = require('swig');

var fs = require("../fs");
var parse = require("../../parse");
var BaseGenerator = require("../generator");

// Swig filter for returning the count of lines in a code section
swig.setFilter('lines', function(content) {
    return content.split('\n').length;
});

// Swig filter for returning a link to the associated html file of a markdown file
swig.setFilter('mdLink', function(link) {
    return link.replace(".md", ".html");
});

var Generator = function() {
    BaseGenerator.apply(this, arguments);

    // Load base template
    this.template = swig.compileFile(path.resolve(this.options.theme, 'templates/site.html'));
    this.langsTemplate = swig.compileFile(path.resolve(this.options.theme, 'templates/langs.html'));
};
util.inherits(Generator, BaseGenerator);


// Generate a template
Generator.prototype._writeTemplate = function(tpl, options, output) {
    var that = this;
    return Q()
    .then(function(sections) {
        return tpl(_.extend({
            title: that.options.title,
            description: that.options.description,

            githubAuthor: that.options.github.split("/")[0],
            githubId: that.options.github,
            githubHost: that.options.githubHost,

            summary: that.options.summary,
            allNavigation: that.options.navigation
        }, options));
    })
    .then(function(html) {
        return fs.writeFile(
            output,
            html
        );
    });
};

// Convert a markdown file to html
Generator.prototype.convertFile = function(content, _input) {
    var that = this;
    var progress = parse.progress(this.options.navigation, _input);

    _output = _input.replace(".md", ".html");
    if (_output == "README.html") _output = "index.html";

    var input = path.join(this.options.input, _input);
    var output = path.join(this.options.output, _output);
    var basePath = path.relative(path.dirname(output), this.options.output) || ".";

    return Q()
    .then(function() {
        return parse.page(content, {
            repo: that.options.githubId,
            dir: path.dirname(input) || '/'
        });
    })
    .then(function(sections) {
        return that._writeTemplate(that.template, {
            progress: progress,

            _input: _input,
            content: sections,

            basePath: basePath,
            staticBase: path.join(basePath, "gitbook"),
        }, output);
    });
};

// Generate languages index
Generator.prototype.langsIndex = function(langs) {
    var that = this;
    var basePath = ".";

    return this._writeTemplate(this.langsTemplate, {
        langs: langs.list,

        basePath: basePath,
        staticBase: path.join(basePath, "gitbook"),
    }, path.join(this.options.output, "index.html"))
    .then(function() {
        // Copy assets
        return that.copyAssets();
    });
};

// Copy assets
Generator.prototype.copyAssets = function() {
    var that = this;

    return fs.copy(
        path.join(that.options.theme, "assets"),
        path.join(that.options.output, "gitbook")
    );
};
Generator.prototype.finish = Generator.prototype.copyAssets;

module.exports = Generator;