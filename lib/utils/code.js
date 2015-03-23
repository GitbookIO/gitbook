var hljs = require('highlight.js');

var MAP = {
    'py': 'python',
    'js': 'javascript',
    'json': 'javascript',
    'rb': 'ruby',
    'csharp': 'cs',
};

function normalize(lang) {
    if(!lang) { return null; }

    var lower = lang.toLowerCase();
    return MAP[lower] || lower;
}

function highlight(lang, code) {
    if(!lang) return code;

    // Normalize lang
    lang = normalize(lang);

    try {
        return hljs.highlight(lang, code).value;
    } catch(e) { }

    return code;
}

// Exports
module.exports = {
    highlight: highlight,
    normalize: normalize,
    MAP: MAP
};
