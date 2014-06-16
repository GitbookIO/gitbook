var _ = require('lodash');

// Cleans up an article/chapter object
// remove 'articles' attributes
function clean(obj) {
    return obj && _.omit(obj, ['articles']);
}

function flattenChapters(chapters) {
    return _.reduce(chapters, function(accu, chapter) {
        return accu.concat([clean(chapter)].concat(flattenChapters(chapter.articles)));
    }, []);
}

function defaultChapters(flatChapters) {
    // Special README nav
    var README_NAV = {
        path: 'README.md',
        title: 'Introduction',
        level: '0',
    };

    // First chapter
    var first = _.first(flatChapters);

    // Check for intro node
    if(first && first.path === 'README.md') {
        // If present, return unmodified
        return flatChapters;
    }

    // Otherwise add in default node
    return [README_NAV].concat(flatChapters);
}

// Returns from a summary a map of
/*
    {
        "file/path.md": {
            prev: ...,
            next: ...,
        },
        ...
    }
*/
function navigation(summary, files) {
    // Support single files as well as list
    files = _.isArray(files) ? files : (_.isString(files) ? [files] : null);

    // List of all navNodes
    // Flatten chapters, then add in default README node if ndeeded etc ...
    var navNodes = defaultChapters(flattenChapters(summary.chapters));
    var prevNodes = [null].concat(navNodes.slice(0, -1));
    var nextNodes = navNodes.slice(1).concat([null]);

    // Mapping of prev/next for a give path
    var mapping = _.chain(_.zip(navNodes, prevNodes, nextNodes))
    .map(function(nodes) {
        var current = nodes[0], prev = nodes[1], next = nodes[2];

        // Skip if no path
        if(!current.path) return null;

        return [current.path, {
            title: current.title,
            prev: prev,
            next: next,
            level: current.level,
        }];
    })
    .filter()
    .object()
    .value();

    // Filter for only files we want
    if(files) {
        return _.pick(mapping, files);
    }

    return mapping;
}


// Exports
module.exports = navigation;
