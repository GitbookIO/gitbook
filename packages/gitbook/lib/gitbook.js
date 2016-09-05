var semver = require('semver');
var pkg = require('../package.json');

var VERSION = pkg.version;
var VERSION_STABLE = VERSION.replace(/\-(\S+)/g, '');

var START_TIME = new Date();

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
    satisfies: satisfies,
    START_TIME: START_TIME
};
