var nunjucks = require('nunjucks');
var location = require('../utils/location');

/*
Simple nunjucks loader which is passing the reponsability to the Output
*/

var Loader = nunjucks.Loader.extend({
    async: true,

    init: function(output, opts) {
        this.output = output;
    },

    getSource: function(sourceURL, callback) {
        this.output.onGetTemplate(sourceURL)
        .then(function(out) {
            // We disable cache since content is modified (shortcuts, ...)
            out.noCache = true;

            return out;
        })
        .nodeify(callback);
    },

    resolve: function(from, to) {
        return this.output.onResolveTemplate(from, to);
    },

    // Handle all files as relative, so that nunjucks pass responsability to 'resolve'
    isRelative: function(filename) {
        return location.isRelative(filename);
    }
});

module.exports = Loader;
