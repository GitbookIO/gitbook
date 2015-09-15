var _ = require("lodash");

// Cleans up an article/chapter object
// remove "articles" attributes
function clean(obj) {
    return obj && _.omit(obj, ["articles"]);
}

function flattenChapters(chapters) {
    return _.reduce(chapters, function(accu, chapter) {
        return accu.concat([clean(chapter)].concat(flattenChapters(chapter.articles)));
    }, []);
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
    // Flatten chapters
    var navNodes = flattenChapters(summary.chapters);

    // Mapping of prev/next for a give path
    var mapping = _.chain(navNodes)
    .map(function(current, i) {
        var prev = null, next = null;

        // Skip if no path
        if(!current.exists) return null;

        // Find prev
        prev = _.chain(navNodes.slice(0, i))
            .reverse()
            .find(function(node) {
                return node.exists && !node.external;
            })
            .value();

        // Find next
        next = _.chain(navNodes.slice(i+1))
            .find(function(node) {
                return node.exists && !node.external;
            })
            .value();

        return [current.path, {
            index: i,
            title: current.title,
            introduction: current.introduction,
            prev: prev,
            next: next,
            level: current.level,
        }];
    })
    .compact()
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
