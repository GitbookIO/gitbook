var MAP = {
    'py': 'python',
    'js': 'javascript',
    'rb': 'ruby',
};

function normalize(lang) {
    var lower = lang.toLowerCase();
    return MAP[lower] || lower;
}

// Exports
module.exports = {
    normalize: normalize,
    MAP: MAP
};
