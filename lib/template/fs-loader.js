var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var nunjucks = require('nunjucks');

/*
    Nunjucks loader similar to FileSystemLoader, but avoid infinite looping
*/

var Loader = nunjucks.Loader.extend({
    init: function(searchPaths) {
        this.searchPaths = searchPaths.map(path.normalize);
    },

    getSource: function(fullpath) {
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

    resolve: function(from, to) {
        var resultFolder = _.find(this.searchPaths, function(basePath) {
            var p = path.resolve(basePath, to);

            return (
                p.indexOf(basePath) === 0
                && p != from
                && fs.existsSync(p)
            );
        });

        return path.resolve(resultFolder, to);
    }
});

module.exports = Loader;
