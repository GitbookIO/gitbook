var fs = require('fs');

var Promise = require('./promise');
var command = require('./command');
var error = require('./error');

// Convert a svg file to a pmg
function convertSVGToPNG(source, dest, options) {
    if (!command.isAvailable) return Promise.reject(new Error('Could not convert SVG in this platform'));
    if (!fs.existsSync(source)) return Promise.reject(new error.FileNotFoundError({ filename: source }));

    return command.spawn('svgexport', [source, dest])
    .fail(function(err) {
        if (err.code == 'ENOENT') err = new Error('Need to install "svgexport" using "npm install svgexport -g"');
        throw err;
    })
    .then(function() {
        if (fs.existsSync(dest)) return;

        throw new Error('Error converting '+source+' into '+dest);
    });
}

module.exports = {
    convertSVGToPNG: convertSVGToPNG,
    INVALID: ['.svg']
};