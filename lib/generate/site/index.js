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
var Manifest = require('../manifest');



var Generator = function() {
    BaseGenerator.apply(this, arguments);

    // Attach methods to instance
    _.bindAll(this);

    this.revision = Date.now();
    this.indexer = indexer();
    this.manifest = new Manifest(Date.now());
    this.manifest.add("NETWORK", [
        '*'
    ]);
};
util.inherits(Generator, BaseGenerator);

// Load all templates
Generator.prototype.loadTemplates = function() {
    this.template = swig.compileFile(
        this.plugins.template("site") || path.resolve(this.options.theme, 'templates/site.html')
    );
    this.langsTemplate = swig.compileFile(
        this.plugins.template("langs") || path.resolve(this.options.theme, 'templates/langs.html')
    );
};

// Load plugins
Generator.prototype.loadPlugins = function() {
    var that = this;

    return BaseGenerator.prototype.loadPlugins.apply(this)
    .then(function() {
        return that.loadTemplates();
    });
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

            githubAuthor: that.options.github ? that.options.github.split("/")[0] : "",
            githubId: that.options.github,
            githubHost: that.options.githubHost,

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
    this.indexer.add(lexed, pagePath);
    return Q();
};

// Convert a markdown file to html
Generator.prototype.convertFile = function(content, _input) {
    var that = this;

    _output = _input.replace(".md", ".html");
    if (_output == "README.html") _output = "index.html";

    var input = path.join(this.options.input, _input);
    var output = path.join(this.options.output, _output);
    var basePath = path.relative(path.dirname(output), this.options.output) || ".";

    var page = {
        path: _input,
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
        // Lex page
        return parse.lex(page.content);
    })
    .then(function(lexed) {
        // Index page in search
        return that.indexPage(lexed, _output)
        .then(_.constant(lexed));
    })
    .then(function(lexed) {
        // Get HTML generated sections
        return parse.page(lexed, {
            repo: that.options.githubId,
            dir: path.dirname(_input) || '/',
            outdir: path.dirname(_input) || '/',
        });
    })
    .then(function(sections) {
        page.sections = sections;

        // Use plugin hook
        return _callHook("page");
    })
    .then(function() {
        that.manifest.add("CACHE", _output);

        return that._writeTemplate(that.template, {
            progress: page.progress,

            _input: _input,
            content: page.sections,

            basePath: basePath,
            staticBase: links.join(basePath, "gitbook"),
        }, output, function(html) {
            page.content = html;

            return _callHook("page:after").get("content")
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

// Copy assets
Generator.prototype.copyAssets = function() {
    var that = this;

    // Copy gitbook assets
    return fs.copy(
        path.join(that.options.theme, "assets"),
        path.join(that.options.output, "gitbook")
    )

    // Add to cach manifest
    .then(function() {
        return that.manifest.addFolder(path.join(that.options.output, "gitbook"), "gitbook");
    })

    // Copy plugins assets
    .then(function() {
        return Q.all(
            _.map(that.plugins.list, function(plugin) {
                if (!plugin.hasAssets()) return Q();

                var pluginAssets = path.join(that.options.output, "gitbook/plugins/", plugin.name);
                return plugin.copyAssets(pluginAssets)
                .then(function() {
                    return that.manifest.addFolder(pluginAssets, "gitbook/plugins/"+plugin.name);
                });
            })
        );
    })
};

// Dump search index to disk
Generator.prototype.writeSearchIndex = function() {
    return fs.writeFile(
        path.join(this.options.output, 'search_index.json'),
        this.indexer.dump()
    );
};


// Add cache manifest
Generator.prototype.writeCacheManifest = function() {
    return fs.writeFile(
        path.join(this.options.output, 'manifest.appcache'),
        this.manifest.dump()
    );
};

Generator.prototype.finish = function() {
    var deferred = this.copyAssets().then(this.writeSearchIndex);

    if (this.options.cache !== false) {
        deferred = deferred.then(this.writeCacheManifest);
    }

    return deferred;
};

module.exports = Generator;
