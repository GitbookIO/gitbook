const fs = require('fs-extra');
const path = require('path');

const TEMPLATE_DIR = path.resolve(__dirname, '../template');

/**
 * Create a new plugin
 * @param  {String} outputDir
 * @param  {String} spec.name
 * @param  {String} spec.desc
 */
function create(outputDir, spec) {
    const pkg = {
        'name': `gitbook-plugin-${spec.name}`,
        'description': `${spec.desc}`,
        'main': 'index.js',
        'browser': './_assets/plugin.js',
        'version': '0.0.0',
        'dependencies': {
            'gitbook-core': '^0.0.0'
        },
        'devDependencies': {
            'gitbook-plugin': '*'
        },
        'engines': {
            'gitbook': '>=3.0.0'
        },
        'scripts': {
            'build-js': 'gitbook-plugin build ./src/index.js ./_assets/plugin.js',
            'prepublish': 'npm run build-js'
        },
        'homepage': `${spec.github}`,
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
