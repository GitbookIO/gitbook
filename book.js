var pkg = require('./package.json');

module.exports = {
    root: './docs',
    title: 'GitBook Documentation',

    plugins: ['theme-official'],
    theme: 'official',
    variables: {
        version: pkg.version
    }
};
