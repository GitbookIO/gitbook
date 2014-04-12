var Q = require('q');
var _ = require('lodash');

var path = require('path');

var fs = require('./fs');
var parse = require('../parse');


// Extract paths out of a summary
function paths(summary) {
    return _.reduce(summary.chapters, function(accu, chapter) {
        return accu.concat(
            _.filter([chapter.path].concat(_.pluck(chapter.articles, 'path')))
        );
    }, []);
}

// Get the parent folders out of a group of files
function folders(files) {
    return _.chain(files)
    .map(function(file) {
        return path.dirname(file);
    })
    .uniq()
    .value();
}

function initDir(dir) {
    return fs.readFile(path.join(dir, 'SUMMARY.md'), 'utf8')
    .then(function(src) {
        // Parse summary
        return parse.summary(src);
    })
    .then(function(summary) {
        // Extract paths from summary
        return paths(summary);
    })
    .then(function(paths) {
        // Convert to absolute paths
        return _.map(paths, function(file) {
            return path.resolve(file);
        });
    })
    .then(function(files) {
        // Create folders
        return Q.all(_.map(folders(files), function(folder) {
            return fs.mkdirp(folder);
        }))
        .then(_.constant(files));
    })
    .then(function(files) {
        // Create files that don't exist
        return Q.all(_.map(files, function(file) {
            return fs.exists(file)
            .then(function(exists) {
                if(exists) return;
                return fs.writeFile(file, '');
            });
        }));
    })
    .fail(function(err) {
        console.error(err.stack);
    });
}


// Exports
module.exports = initDir;
