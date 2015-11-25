var _ = require('lodash');

// Returns from a navigation and a current file, a snapshot of current detailed state
function calculProgress(navigation, current) {
    var n = _.size(navigation);
    var percent = 0, prevPercent = 0, currentChapter = null;
    var done = true;

    var chapters = _.chain(navigation)

    // Transform as array
    .map(function(nav, path) {
        nav.path = path;
        return nav;
    })

    // Sort entries
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
    .value();

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

module.exports = calculProgress;
