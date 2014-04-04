var _ = require('lodash');

// Cleans up an article/chapter object
// remove 'articles' attributes
function clean(obj) {
    return obj && _.omit(obj, ['articles']);
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

    // Mapping of prev/next for a give path
    var mapping = {};

    // Special README nav
    var README_NAV = {
        path: 'README.md',
        title: 'Introduction',
    };

    // Walk the chapter/article tree and create navigation entires
    _.each(summary.chapters, function(chapter, idx, chapters) {
        // Skip if no path
        if(!chapter.path) return;

        var currentChapter = clean(chapter);
        var prevChapter = (idx-1 < 0) ? README_NAV : chapters[idx-1];
        var nextChapter = (idx+1 >= chapters.length) ? null : chapters[idx+1];

        var prev = (!prevChapter || _.isEmpty(prevChapter.articles)) ?
            prevChapter : _.last(prevChapter.articles);
        var next = (!chapter || _.isEmpty(chapter.articles)) ?
            nextChapter : _.first(chapter.articles);

        // Add chapter mapping
        mapping[chapter.path] = {
            title: chapter.title,
            prev: clean(prev),
            next: clean(next),
            level: (idx+1).toString(),
        };

        // Check a chapter's articles
        _.each(chapter.articles, function(article, _idx, articles) {
            // Skip if no path
            if(!article.path) return;

            var prev = (_idx-1 < 0) ? currentChapter : clean(articles[_idx-1]);
            var next = (_idx+1 >= articles.length) ? nextChapter : clean(articles[_idx+1]);

            mapping[article.path] = {
                title: article.title,
                prev: clean(prev),
                next: clean(next),
                level: [idx+1, _idx+1].join('.'),
            };
        });
    });

    // Hack for README.html
    mapping['README.md'] = {
        title: README_NAV.title,
        prev: null,
        next: clean(summary.chapters[0]),
        level: '0',
    };

    // Filter for only files we want
    if(files) {
        return _.pick(mapping, files);
    }

    return mapping;
}


// Exports
module.exports = navigation;
