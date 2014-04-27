var _ = require('lodash');
var path = require('path');
var Q = require('q');

var fs = require("./fs");

var extsToIgnore = [".gz"]

var Manifest = function() {
    this.revision = 0;
    this.clear(Date.now());
};

// Regenerate manifest
Manifest.prototype.clear = function(revision) {
    if (revision) this.revision = revision;
    this.sections = {
        'CACHE': {},
        'NETWORK': {},
        'FALLBACK': {}
    };
    return Q(this);
};

// Add a resource
Manifest.prototype.add = function(category, resource, value) {
    if (_.isArray(resource)) {
        _.each(resource, function(subres) {
            this.add(category, subres, value);
        }, this);
        return;
    }
    this.sections[category][resource] = value;
};

// Add a directory in cache
Manifest.prototype.addFolder = function(folder, root, except) {
    var that = this;
    root = root || "/";

    return fs.list(folder)
    .then(function(files) {
        _.each(
            // Ignore diretcories
            _.filter(files, function(file) {
                return file.substr(-1) != "/" && !_.contains(except, path.join(root, file)) && !_.contains(extsToIgnore, path.extname(file));
            }),
            function(file) {
                that.add("CACHE", path.join(root, file));
            }
        );
    })
};

// Get manifest content
Manifest.prototype.dump = function() {
    var lines = [
        "CACHE MANIFEST",
        "# Revision "+this.revision
    ];

    _.each(this.sections, function(content, section) {
        if (_.size(content) == 0) return;
        lines.push("");
        lines.push(section+":");
        lines = lines.concat(_.keys(content));
    }, this);

    return Q(lines.join("\n"));
};

module.exports = Manifest;
