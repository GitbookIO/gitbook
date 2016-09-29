const fs = require('fs-extra');
const Promise = require('q');
const browserify = require('browserify');
const babelify = require('babelify');

/**
 * Compile a plugin to work with "gitbook-core" in the browser.
 * @param {String} inputFile
 * @param {String} outputFile
 * @return {Promise}
 */
function compilePlugin(inputFile, outputFile) {
    const d = Promise.defer();
    const b = browserify({
        standalone: 'GitBookPlugin'
    });

    b.add(inputFile);
    b.external('react');
    b.external('react-dom');
    b.external('gitbook-core');
    b.transform(babelify, {
        presets: [
            require('babel-preset-es2015'),
            require('babel-preset-react')
        ]
    });

    fs.ensureFileSync(outputFile);

    const output = fs.createWriteStream(outputFile);

    b.bundle()
    .pipe(output)
    .on('error', (err) => d.reject(err))
    .on('end', () => d.resolve());

    return d.promise;
}

module.exports = compilePlugin;
