var semver = require("semver");
var fs = require("./fs");

var pkg = require("../../package.json");

var Plugin = function(name) {
    this.name = name;
    this.packageInfos = {};

    try {
        this.packageInfos = require(name+"/package.json");
    } catch (e) {
        this.packageInfos = {};
    }
};

// Test if it's a valid plugin
Plugin.prototype.isValid = function() {
    return (
        this.packageInfos
        && this.packageInfos.name
        && this.packageInfos.engines
        && this.packageInfos.engines.gitbook
        && semver.satisfies(pkg.version, this.packageInfos.engines.gitbook)
    );
};

module.exports = Plugin;