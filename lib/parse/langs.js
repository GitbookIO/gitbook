var _ = require("lodash");
var parseEntries = require("./summary").entries;


var parseLangs = function(content) {
    var entries = parseEntries(content);

    return {
        list: _.chain(entries)
            .filter(function(entry) {
                return Boolean(entry.path);
            })
            .map(function(entry) {
                return {
                    title: entry.title,
                    path: entry.path,
                    lang: entry.path.replace("/", "")
                };
            })
            .value()
    };
};


module.exports = parseLangs;