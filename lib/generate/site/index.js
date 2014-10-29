var util = require("util");
var path = require("path");
var Q = require("q");
var _ = require("lodash");
var swig = require("../template");

var fs = require("../fs");
var parse = require("../../parse");
var BaseGenerator = require("../generator");
var links = require("../../utils/links");
var indexer = require('./search_indexer');
var glossaryIndexer = require('./glossary_indexer');


var Generator = function() {
    BaseGenerator.apply(this, arguments);

    // Attach methods to instance
    _.bindAll(this);

    this.revision = Date.now();
    this.indexer = indexer();
};
util.inherits(Generator, BaseGenerator);

// Add template loading to load
Generator.prototype.load = function() {
    var that = this;

    return BaseGenerator.prototype.load.apply(this)
    .then(function() {
        return that.loadTemplates();
    });
};

// Load all templates
Generator.prototype.loadTemplates = function() {
    this.template = swig.compileFile(
        this.plugins.template("site") || path.resolve(this.options.theme, 'templates/site.html')
    );
    this.langsTemplate = swig.compileFile(
        this.plugins.template("langs") || path.resolve(this.options.theme, 'templates/langs.html')
    );
    this.glossaryTemplate = swig.compileFile(
        this.plugins.template("glossary") || path.resolve(this.options.theme, 'templates/glossary.html')
    );
};

// Generate a template
Generator.prototype._writeTemplate = function(tpl, options, output, interpolate) {
    var that = this;

    interpolate = interpolate || _.identity;
    return Q()
    .then(function(sections) {
        return tpl(_.extend({
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
        }, options));
    })
    .then(interpolate)
    .then(function(html) {
        return fs.writeFile(
            output,
            html
        );
    });
};

Generator.prototype.indexPage = function(lexed, pagePath) {
    // Setup glossary indexer if not yet setup
    if(!this.glossaryIndexer) {
        this.glossaryIndexer = glossaryIndexer(this.options.glossary);
    }

    this.indexer.add(lexed, pagePath);
    this.glossaryIndexer.add(lexed, pagePath);
    return Q();
};

// Convert a markdown file into a normalized data set
Generator.prototype.prepareFile  = function(content, _input) {
    var that = this;

    var input = path.join(this.options.input, _input);

    var page = {
        path: _input,
        rawPath: input,
        content: content,
        progress: parse.progress(this.options.navigation, _input)
    };

    var _callHook = function(name) {
        return that.callHook(name, page)
        .then(function(_page) {
            page = _page;
            return page;
        });
    };

    return Q()
    .then(function() {
        // Send content to plugins
        return _callHook("page:before");
    })
    .then(function() {
        // Lex, parse includes and get
        // Get HTML generated sections
        return parse.page(page.content, {
            // Local files path
            dir: path.dirname(_input) || '/',
            // Project's include folder
            includes_dir: path.join(that.options.input, '_includes'),
            // Output directory
            outdir: path.dirname(_input) || '/',
            // Templating variables
            variables: that.options.variables,
        });
    })
    .then(function(sections) {
        page.sections = sections;

        // Use plugin hook
        return _callHook("page");
    })
    .then(function() {
        return page;
    });
};

// Convert a markdown file to html
Generator.prototype.convertFile = function(content, _input) {
    var that = this;

    var _output = _input.replace(".md", ".html");
    if (_output == "README.html") _output = "index.html";
    var output = path.join(this.options.output, _output);
    var basePath = path.relative(path.dirname(output), this.options.output) || ".";

    return this.prepareFile(content, _input)
    .then(function(page) {
        // Index page in search
        return that.indexPage(page.lexed, _output).thenResolve(page);
    })
    .then(function(page) {
        // Write file
        return that._writeTemplate(that.template, {
            progress: page.progress,

            _input: page.path,
            content: page.sections,

            basePath: basePath,
            staticBase: links.join(basePath, "gitbook"),
        }, output, function(html) {
            page.content = html;

            return that.callHook("page:after", page).get("content")
        });
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

// Generate glossary
Generator.prototype.writeGlossary = function() {
    var that = this;
    var basePath = ".";

    // No glossary
    if (!this.glossaryIndexer) return Q();

    // Transform the glossary to get term, description, files
    var glossary = _.chain(this.glossaryIndexer.invertedIdx)
    .map(function(links, id) {
        var term = _.find(that.options.glossary, { 'id': id });

        return {
            id: id,
            name: term.name,
            description: term.description,
            files: _.chain(links)
                .map(function(link) {
                    var name = link.slice(0, -5);

                    if (name == "index") {
                        name = "README";
                    }
                    return that.options.navigation[name+".md"];
                })
                .sortBy("percent")
                .value()
        }
    })
    .sortBy("name")
    .value();

    return this._writeTemplate(this.glossaryTemplate, {
        glossaryIndex: glossary,
        basePath: basePath,
        staticBase: path.join(basePath, "gitbook"),
    }, path.join(this.options.output, "GLOSSARY.html"));
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

// Dump search index to disk
Generator.prototype.writeSearchIndex = function() {
    return fs.writeFile(
        path.join(this.options.output, 'search_index.json'),
        this.indexer.dump()
    );
};

// Dump glossary index to disk
Generator.prototype.writeGlossaryIndex = function() {
    if (!this.glossaryIndexer) return Q();

    return fs.writeFile(
        path.join(this.options.output, 'glossary_index.json'),
        JSON.stringify(this.options.glossary)
    );
};


Generator.prototype.finish = function() {
    return this.copyAssets()
    .then(this.copyCover)
    .then(this.writeGlossary)
    .then(this.writeGlossaryIndex)
    .then(this.writeSearchIndex);
};

module.exports = Generator;
