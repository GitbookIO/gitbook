var _ = require("lodash");

// Returns from a navigation and a current file, a snapshot of current detailed state
var calculProgress = function(navigation, current) {
    var n = _.size(navigation);
    var percent = 0, prevPercent = 0, currentChapter = null;
    var done = true;

    var chapters = _.chain(navigation)
    .map(function(nav, path) {
        nav.path = path;
        return nav;
    })
    .sortBy(function(nav) {
        return nav.level;
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