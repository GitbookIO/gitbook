const resolve = require('resolve');

const { exec } = require('../utils/command');
const resolveVersion = require('./resolveVersion');

/**
 * Install a plugin for a book
 *
 * @param {Book} book
 * @param {PluginDependency} plugin
 * @return {Promise}
 */
function installPlugin(book, plugin) {
    const logger = book.getLogger();

    const installFolder = book.getRoot();
    const name = plugin.getName();
    const requirement = plugin.getVersion();

    logger.info.ln('');
    logger.info.ln('installing plugin "' + name + '"');

    const installerBin = resolve.sync('ied/lib/cmd.js');

    // Find a version to install
    return resolveVersion(plugin)
    .then((version) => {
        if (!version) {
            throw new Error('Found no satisfactory version for plugin "' + name + '" with requirement "' + requirement + '"');
        }

        logger.info.ln('install plugin "' + name + '" (' + requirement + ') with version', version);

        const npmID = plugin.getNpmID();
        const command = `${installerBin} install ${npmID}@${version}`;

        return exec(command, { cwd: installFolder });
    })
    .then(() => {
        logger.info.ok('plugin "' + name + '" installed with success');
    });
}

module.exports = installPlugin;
