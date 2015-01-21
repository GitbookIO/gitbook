var _ = require("lodash");
var path = require("path");
var Q = require("q");
var fs = require("./utils/fs");

var Plugin = require("./plugin");

var BaseGenerator = function(book) {
    this.book = book;

    Object.defineProperty(this, "options", {
        get: function () {
            return this.book.options;
        }
    });

    // Base for assets in plugins
    this.pluginAssetsBase = "book";

    _.bindAll(this);
};

BaseGenerator.prototype.callHook = function(name, data) {
    //return this.plugins.hook(name, data);
    return Q();
};

// Prepare the genertor
BaseGenerator.prototype.prepare = function() {
    return this.preparePlugins();
};

BaseGenerator.prototype.preparePlugins = function() {
    var that = this;
    return Plugin.normalize(that.book.plugins)
    .then(function(_plugins) {
        that.plugins = _plugins;
    });
};

// Write a parsed file to the output
BaseGenerator.prototype.writeParsedFile = function(page, input) {
    return Q.reject(new Error("Could not convert "+input));
};

// Copy file to the output (non parsable)
BaseGenerator.prototype.transferFile = function(input) {
    return fs.copy(
        path.join(this.options.input, input),
        path.join(this.options.output, input)
    );
};

// Copy a folder to the output
BaseGenerator.prototype.transferFolder = function(input) {
    return fs.mkdirp(
        path.join(this.book.options.output, input)
    );
};

// Copy the cover picture
BaseGenerator.prototype.copyCover = function() {
    var that = this;

    return Q.all([
        fs.copy(path.join(that.book.root, "cover.jpg"), path.join(that.options.output, "cover.jpg")),
        fs.copy(path.join(that.book.root, "cover_small.jpg"), path.join(that.options.output, "cover_small.jpg"))
    ])
    .fail(function() {
        // If orignaly from multi-lang, try copy from parent
        if (!that.isMultilingual()) return;

        return Q.all([
            fs.copy(path.join(that.book.parentRoot(), "cover.jpg"), path.join(that.options.output, "cover.jpg")),
            fs.copy(path.join(that.book.parentRoot(), "cover_small.jpg"), path.join(that.options.output, "cover_small.jpg"))
        ]);
    })
    .fail(function(err) {
        return Q();
    });
};

// Generate the langs index
BaseGenerator.prototype.langsIndex = function(langs) {
    return Q.reject(new Error("Langs index is not supported in this generator"));
};

// At teh end of the generation
BaseGenerator.prototype.finish = function() {
    return Q.reject(new Error("Could not finish generation"));
};

module.exports = BaseGenerator;
