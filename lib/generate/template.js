var path = require("path");
var swig = require('swig');
var hljs = require('highlight.js');

var pkg = require('../../package.json');

swig.setDefaults({
    locals: {
        gitbook: {
            version: pkg.version
        }
    }
});

// Swig filter for returning the count of lines in a code section
swig.setFilter('lines', function(content) {
    return content.split('\n').length;
});

// Swig filter for returning a link to the associated html file of a markdown file
swig.setFilter('mdLink', function(link) {
    var link = link.replace(".md", ".html");
    if (link == "README.html") link = "index.html";
    return link;
});


// Swig filter: highlight coloration
swig.setFilter('code', function(code, lang) {
    try {
        return hljs.highlight(lang, code).value;
    } catch(e) {
        return hljs.highlightAuto(code).value;
    }
});

// Convert a level into a deep level
swig.setFilter('lvl', function(lvl) {
    return lvl.split(".").length;
});

// Join path
swig.setFilter('pathJoin', function(base, _path) {
    return path.join(base, _path);
});

module.exports = swig;
