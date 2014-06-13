var _ = require('lodash');
var marked = require('marked');


// Utility function for splitting a list into groups
function splitBy(list, starter, ender) {
    var starts = 0;
    var ends = 0;
    var group = [];

    // Groups
    return _.reduce(list, function(groups, value) {
        // Ignore start and end delimiters in resulted groups
        if(starter(value)) {
            starts++;
        } else if(ender(value)) {
            ends++;
        }

        // Add current value to group
        group.push(value);

        // We've got a matching
        if(starts === ends && starts !== 0) {
            // Add group to end groups
            // (remove starter and ender token)
            groups.push(group.slice(1, -1));

            // Reset group
            group = [];
        }

        return groups;
    }, []);
}

function listSplit(nodes, start_type, end_type) {
    return splitBy(nodes, function(el) {
        return el.type === start_type;
    }, function(el) {
        return el.type === end_type;
    });
}

// Get the biggest list
// out of a list of marked nodes
function filterList(nodes) {
    return _.chain(nodes)
    .toArray()
    .rest(function(el) {
        // Get everything after list_start
        return el.type !== 'list_start';
    })
    .reverse()
    .rest(function(el) {
        // Get everything after list_end (remember we're reversed)
        return el.type !== 'list_end';
    })
    .reverse()
    .value().slice(1, -1);
}

// Parses an Article or Chapter title
// supports extracting links
function parseTitle(src, nums) {
    // Check if it's a link
    var matches = marked.InlineLexer.rules.link.exec(src);

    var level = nums.join('.');

    // Not a link, return plain text
    if(!matches) {
        return {
            title: src,
            level: level,
            path: null,
        };
    }

    return {
        title: matches[1],
        level: level,

        // Replace .md references with .html
        path: matches[2].replace(/\\/g, '/'),
    };
}

function parseChapter(nodes, nums) {
    return _.extend(parseTitle(_.first(nodes).text, nums), {
        articles: _.map(listSplit(filterList(nodes), 'list_item_start', 'list_item_end'), function(nodes, i) {
            return parseChapter(nodes, nums.concat(i + 1));
        })
    });
}

function isPartHeading(el) {
    return el.type === 'paragraph' || (el.type === 'heading' && el.depth === 2);
}

function getPartNodes(nodes) {
    var parts = [];
    var partNodes = [];
    var starts = 0;
    var ends = 0;

    _.forEach(nodes, function(el) {
        if (starts === 0 && isPartHeading(el)) {
            partNodes.push(el);
        }

        if (el.type == "list_start") {
            starts++;
        } else if (el.type == "list_end") {
            ends++;
        }

        if (starts > 0) {
            partNodes.push(el);

            if (starts == ends) {
                parts.push(partNodes);
                partNodes = [];
                starts = 0;
                ends = 0;
            }
        }
    });

    return parts;
}

function parseSummary(src) {
    var nodes = marked.lexer(src);

    var partNodes = getPartNodes(nodes);

    var parts = _.chain(partNodes)
        .map(function(chapterList, i) {
            var headingNode = _.first(chapterList);

            var sliceStart = 1;
            var heading = {};
            if (isPartHeading(headingNode)) {
                heading = parseTitle(headingNode.text, [i + 1]);
                sliceStart++;
            }

            // Get rid of the list_start/list_end pair
            chapterList = chapterList.slice(sliceStart, -1);

            var chapters = _.chain(listSplit(chapterList, 'list_item_start', 'list_item_end'))
                .map(function(nodes, j) {
                    return parseChapter(nodes, [i + 1, j + 1]);
                })
                .value();

            return _.extend(heading, { chapters: chapters });
        })
        .value();

    var chapterNum = 0;
    var chapters = _.chain(partNodes)
        .map(function(chapterList) {
            var headingNode = _.first(chapterList);

            var sliceStart = 1;
            var heading = [];
            if (isPartHeading(headingNode)) {
                chapterNum++;
                return parseChapter(chapterList, [chapterNum]);
            }

            // Get rid of the list_start/list_end pair
            chapterList = chapterList.slice(sliceStart, -1);

            var articles = _.chain(listSplit(chapterList, 'list_item_start', 'list_item_end'))
                .map(function(nodes, i) {
                    return parseChapter(nodes, [i+1]);
                })
                .value();
            return articles;
        })
        .flatten()
        .value();

    return {
        parts: parts,

        // For backwards compatibility
        chapters: chapters
    };
}


// Exports
module.exports = parseSummary;
