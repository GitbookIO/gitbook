var svgexport = require('svgexport');
var Promise = require('./promise');
var command = require('./command');
var fs = require('./fs');
var error = require('./error');

// Convert a svg file to a pmg
function convertSVGToPNG(source, dest, options) {
    if (!fs.existsSync(source)) return Promise.reject(new error.FileNotFoundError({ filename: source }));

    var d = Promise.defer();
    svgexport.render({
        'input' : [source],
        'output': [dest]
    }, function (err, data) {
        if (err) return d.reject(err);
        d.resolve(data);
    });
    return d.promise
    .then(function() {
        if (fs.existsSync(dest)) return;

        throw new Error('Error converting '+source+' into '+dest);
    });
}

// Convert a svg buffer to a png file
function convertSVGBufferToPNG(buf, dest) {
    // Create a temporary SVG file to convert
    return fs.tmpFile({
        postfix: '.svg'
    })
    .then(function(tmpSvg) {
        return fs.writeFile(tmpSvg, buf)
        .then(function() {
            return convertSVGToPNG(tmpSvg, dest);
        });
    });
}

// Converts a inline data: to png file
function convertInlinePNG(source, dest) {
    if (!/^data\:image\/png/.test(source)) return Promise.reject(new Error('Source is not a PNG data-uri'));

    var base64data = source.split('data:image/png;base64,')[1];
    var buf = new Buffer(base64data, 'base64');

    return fs.writeFile(dest, buf)
    .then(function() {
        if (fs.existsSync(dest)) return;

        throw new Error('Error converting '+source+' into '+dest);
    });
}

module.exports = {
    convertSVGToPNG: convertSVGToPNG,
    convertSVGBufferToPNG: convertSVGBufferToPNG,
    convertInlinePNG: convertInlinePNG
};
