var _ = require('lodash');

// Cleans up an article/chapter object
// remove 'articles' and '_path' attributes
function clean(obj) {
    return _.omit(obj, ['articles', '_path']);
}

// Returns a map of
/*
    {
        "file/path.html": {
            prev: ...,
            next: ...,
        },
        ...
    }
*/
function navigation(summary, files) {
    // Support single files as well as list
    files = _.isArray(files) ? files : (_.isString(files) ? [files] : null);

    // Mapping of prev/next for a give path
    var mapping = {};

    // Walk the chapter/article tree and create navigation entires
    _.each(summary.chapters, function(chapter, idx, chapters) {
        var currentChapter = clean(chapter);
        var prevChapter = (idx-1 < 0) ? null : clean(chapters[idx-1]);
        var nextChapter = (idx+1 >= chapters.length) ? null : clean(chapters[idx+1]);

        // Add chapter mapping
        mapping[chapter.path] = {
            prev: prevChapter,
            next: nextChapter,
        };

        // Check a chapter's articles
        _.each(chapter.articles, function(article, _idx, articles) {

            var prev = (_idx-1 < 0) ? currentChapter : clean(articles[_idx-1]);
            var next = (_idx+1 >= articles.length) ? nextChapter : clean(articles[_idx+1]);

            mapping[article.path] = {
                prev: prev,
                next: next,
            };
        });
    });

    // Hack for README.html
    mapping['README.html'] = {
        prev: null,
        next: clean(summary.chapters[0]),
    };

    // Filter for only files we want
    if(files) {
        return _.pick(mapping, files);
    }

    return mapping;
}


// Exports
module.exports = navigation;
