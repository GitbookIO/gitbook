var _ = require("lodash")
var parseSummary = require("./summary");

var parseLangs = function(content) {
    var summary = parseSummary(content);

    return {
        list: _.chain(summary.chapters)
            .filter(function(entry) {
                return entry.path != null;
            })
            .map(function(entry) {
                return {
                    title: entry.title,
                    path: entry.path,
                    lang: entry.path.replace("/", "")
                };
            })
            .value()
    }
};

module.exports = parseLangs;