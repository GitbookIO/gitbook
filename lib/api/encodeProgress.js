var Immutable = require('immutable');
var encodeNavigation = require('./encodeNavigation');

/**
    page.progress is a deprecated property from GitBook v2

    @param {Output}
    @param {Page}
    @return {Object}
*/
function encodeProgress(output, page) {
    var current = page.getPath();
    var navigation = encodeNavigation(output);
    navigation = Immutable.Map(navigation);

    var n = navigation.size;
    var percent = 0, prevPercent = 0, currentChapter = null;
    var done = true;

    var chapters = navigation
        .map(function(nav, chapterPath) {
            nav.path = chapterPath;
            return nav;
        })
        .valueSeq()
        .sortBy(function(nav) {
            return nav.index;
        })
        .map(function(nav, i) {
            // Calcul percent
            nav.percent = (i * 100) / Math.max((n - 1), 1);

            // Is it done
            nav.done = done;
            if (nav.path == current) {
                currentChapter = nav;
                percent = nav.percent;
                done = false;
            } else if (done) {
                prevPercent = nav.percent;
            }

            return nav;
        })
        .toJS();

    return {
        // Previous percent
        prevPercent: prevPercent,

        // Current percent
        percent: percent,

        // List of chapter with progress
        chapters: chapters,

        // Current chapter
        current: currentChapter
    };
}

module.exports = encodeProgress;

