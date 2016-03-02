var pkg = require('./package.json');

module.exports = {
    // Documentation for GitBook is stored under "docs"
    root: './docs',
    title: 'GitBook Documentation',

    // Enforce use of GitBook v3
    gitbook: pkg.version,

    // Use the "official" theme
    plugins: ['theme-official'],
    theme: 'official',

    variables: {
        version: pkg.version
    }
};
