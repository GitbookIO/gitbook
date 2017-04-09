var pkg = require('./package.json');

module.exports = {
    // Documentation for GitBook is stored under "docs"
    root: './docs',
    title: 'GitBook Toolchain Documentation',

    // Use the "official" theme
    plugins: ['sitemap'],

    variables: {
        version: pkg.gitbookversion,
        GB: "GitBook"

    },

    pluginsConfig: {
        sitemap: {
            hostname: 'https://toolchain.gitbook.com'
        }
    }
};
