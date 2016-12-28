const npm = require('npm');
const semver = require('semver');
const { Map } = require('immutable');

const Promise = require('../utils/promise');
const Plugin = require('../models/plugin');
const gitbook = require('../gitbook');

let npmIsReady;

/**
 * Initialize and prepare NPM
 * @return {Promise}
 */
function initNPM() {
    if (npmIsReady) return npmIsReady;

    npmIsReady = Promise.nfcall(npm.load, {
        silent: true,
        loglevel: 'silent'
    });

    return npmIsReady;
}

/**
 * Resolve a plugin dependency to a version
 *
 * @param {PluginDependency} plugin
 * @return {Promise<String>}
 */
function resolveVersion(plugin) {
    const npmId = Plugin.nameToNpmID(plugin.getName());
    const requiredVersion = plugin.getVersion();

    if (plugin.isGitDependency()) {
        return Promise.resolve(requiredVersion);
    }

    return initNPM()
    .then(() => {
        return Promise.nfcall(npm.commands.view, [npmId + '@' + requiredVersion, 'engines'], true);
    })
    .then((versions) => {
        versions = Map(versions).entrySeq();

        const result = versions
            .map((entry) => {
                return {
                    version: entry[0],
                    gitbook: (entry[1].engines || {}).gitbook
                };
            })
            .filter((v) => {
                return v.gitbook && gitbook.satisfies(v.gitbook);
            })
            .sort((v1, v2) => {
                return semver.lt(v1.version, v2.version) ? 1 : -1;
            })
            .get(0);

        if (!result) {
            return undefined;
        } else {
            return result.version;
        }
    });
}

module.exports = resolveVersion;
