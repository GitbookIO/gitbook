const fs = require('fs-extra');
const path = require('path');
const GITBOOK_VERSION = require('../package.json').version;

const TEMPLATE_DIR = path.resolve(__dirname, '../template');

/**
 * Create a new plugin
 * @param  {String} outputDir
 * @param  {String} spec.title
 * @param  {String} spec.name
 * @param  {String} spec.desc
 * @param  {Array}  spec.keywords
 */
function create(outputDir, spec) {
    const pkg = {
        'title': `${spec.title}`,
        'name': `gitbook-plugin-${spec.name}`,
        'description': `${spec.desc}`,
        'version': '0.0.0',
        'main': 'index.js',
        'browser': './_assets/plugin.js',
        'ebook': './_assets/plugin.js',
        'devDependencies': {
            'gitbook-plugin': '^' + GITBOOK_VERSION,
            'eslint': '^3.7.1',
            'eslint-config-gitbook': '^1.4.0'
        },
        'peerDependencies': {
            'gitbook-core': '*'
        },
        'engines': {
            'gitbook': '>=4.0.0-alpha.0'
        },
        'scripts': {
            'lint': 'eslint ./',
            'build-website': 'gitbook-plugin build ./src/index.js ./_assets/plugin.js',
            'prepublish': 'npm run build-website',
            'test': 'gitbook-plugin test && npm run lint'
        },
        'homepage': `${spec.github}`,
        'keywords': spec.categories.map(category => `gitbook:${category}`),
        'repository': {
            'type': 'git',
            'url': `${spec.github}.git`
        },
        'bugs': {
            'url': `${spec.github}/issues`
        }
    };

    fs.copySync(TEMPLATE_DIR, outputDir, {
        clobber: true
    });

    fs.outputJsonSync(path.resolve(outputDir, 'package.json'), pkg, {
        spaces: 2
    });
}

module.exports = create;
