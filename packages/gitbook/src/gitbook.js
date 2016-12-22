const semver = require('semver');
const pkg = require('../package.json');

const VERSION = pkg.version;
const VERSION_STABLE = VERSION.replace(/\-(\S+)/g, '');

const START_TIME = new Date();

/**
    Verify that this gitbook version satisfies a requirement
    We can't directly use samver.satisfies since it will break all plugins when gitbook version is a prerelease (beta, alpha)

    @param {String} condition
    @return {Boolean}
*/
function satisfies(condition) {
    // Test with real version
    if (semver.satisfies(VERSION, condition)) return true;

    // Test with future stable release
    return semver.satisfies(VERSION_STABLE, condition);
}

module.exports = {
    version: pkg.version,
    satisfies,
    START_TIME
};
