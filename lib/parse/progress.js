var _ = require("lodash");

var calculProgress = function(navigation, current) {
    var n = _.size(navigation);
    var percent = 0;
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
            percent = nav.percent;
            done = false;
        }
        
        return nav;
    })
    .value();


    return {
        percent: percent,
        chapters: chapters
    };
}

module.exports = calculProgress;