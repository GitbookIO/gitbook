var semver = require('semver');
var pkg = require('../package.json');

var VERSION = pkg.version;
var VERSION_STABLE = VERSION.replace(/\-(\S+)/g, '');

// Test if current current gitbook version satisfies a condition
// We can't directly use samver.satisfies since it will break all plugins when gitbook version is a prerelease (beta, alpha)
function satisfies(condition) {
    // Test with real version
    if (semver.satisfies(VERSION, condition)) return true;

    // Test with future stable release
    return semver.satisfies(VERSION_STABLE, condition);
}

module.exports = {
    satisfies: satisfies
};
