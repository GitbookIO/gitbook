var _ = require("lodash");
var path = require("path");
var Q = require("q");
var fs = require("./fs");

var Plugin = require("./plugin");

var BaseGenerator = function(options) {
    this.options = options;

    this.options.plugins = Plugin.normalizeNames(this.options.plugins);
    this.plugins = [];
};

BaseGenerator.prototype.loadPlugins = function() {
    return Plugin.fromList(this.options.plugins)
    .then(function(_plugins) {
        this.plugins = _plugins;
    }.bind(this));
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

BaseGenerator.prototype.langsIndex = function(langs) {
    return Q.reject(new Error("Langs index is not supported in this generator"));
};

BaseGenerator.prototype.finish = function() {
    return Q.reject(new Error("Could not finish generation"));
};



module.exports = BaseGenerator;