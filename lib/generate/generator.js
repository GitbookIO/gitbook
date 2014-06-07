var _ = require("lodash");
var path = require("path");
var Q = require("q");
var fs = require("./fs");

var Plugin = require("./plugin");

var BaseGenerator = function(options) {
    this.options = options;

    this.options.plugins = Plugin.normalizeNames(this.options.plugins);
    this.options.plugins = _.union(this.options.plugins, this.options.defaultsPlugins);
    this.plugins = [];
};

BaseGenerator.prototype.callHook = function(name, data) {
    return this.plugins.hook(name, this, data);
};

BaseGenerator.prototype.loadPlugins = function() {
    var that = this;

    return Plugin.fromList(this.options.plugins, this.options.input)
    .then(function(_plugins) {
        that.plugins = _plugins;

        return that.callHook("init");
    });
};

BaseGenerator.prototype.convertFile = function(content, input) {
    return Q.reject(new Error("Could not convert "+input));
};

BaseGenerator.prototype.transferFile = function(input) {
    return fs.copy(
        path.join(this.options.input, input),
        path.join(this.options.output, input)
    );
};

BaseGenerator.prototype.transferFolder = function(input) {
    return fs.mkdirp(
        path.join(this.options.output, input)
    );
};

BaseGenerator.prototype.copyCover = function() {
    var that = this;

    return Q.all([
        fs.copy(path.join(this.options.input, "cover.jpg"), path.join(this.options.output, "cover.jpg")),
        fs.copy(path.join(this.options.input, "cover_small.jpg"), path.join(this.options.output, "cover_small.jpg"))
    ])
    .fail(function() {
        // If orignally from multi-lang, try copy from originalInput
        if (!that.options.originalInput) return;

        return Q.all([
            fs.copy(path.join(that.options.originalInput, "cover.jpg"), path.join(that.options.output, "cover.jpg")),
            fs.copy(path.join(that.options.originalInput, "cover_small.jpg"), path.join(that.options.output, "cover_small.jpg"))
        ]);
    })
    .fail(function(err) {
        console.log(err);
        return Q();
    });
};

BaseGenerator.prototype.langsIndex = function(langs) {
    return Q.reject(new Error("Langs index is not supported in this generator"));
};

BaseGenerator.prototype.finish = function() {
    return Q.reject(new Error("Could not finish generation"));
};



module.exports = BaseGenerator;