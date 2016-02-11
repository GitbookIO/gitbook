var pkg = require('./package.json');

module.exports = {
    root: './docs',
    plugins: ['versions'],
    pluginsConfig: {
        versions: {
            type: 'tags'
        }
    },
    variables: {
        version: pkg.version
    }
};
