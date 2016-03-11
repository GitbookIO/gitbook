var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var nunjucks = require('nunjucks');

/*
    Nunjucks loader similar to FileSystemLoader, but avoid infinite looping
*/

function isRelative(filename) {
    return (filename.indexOf('./') === 0 || filename.indexOf('../') === 0);
}

var Loader = nunjucks.Loader.extend({
    init: function(searchPaths) {
        this.searchPaths = searchPaths.map(path.normalize);
    },

    getSource: function(fullpath) {
        if (!fullpath) return null;

        fullpath = this.resolve(null, fullpath);

        if(!fullpath) {
            return null;
        }

        return {
            src: fs.readFileSync(fullpath, 'utf-8'),
            path: fullpath,
            noCache: true
        };
    },

    // We handle absolute paths ourselves in ".resolve"
    isRelative: function() {
        return true;
    },

    resolve: function(from, to) {
        // Relative template like "./test.html"
        if (isRelative(to) && from) {
            return path.resolve(path.dirname(from), to);
        }

        // Absolute template to resolve in root folder
        var resultFolder = _.find(this.searchPaths, function(basePath) {
            var p = path.resolve(basePath, to);

            return (
                p.indexOf(basePath) === 0
                && p != from
                && fs.existsSync(p)
            );
        });
        if (!resultFolder) return null;
        return path.resolve(resultFolder, to);
    }
});

module.exports = Loader;
