var _ = require("lodash");
var path = require("path");

// Return true if file path is inside a folder
function isInRoot(root, filename) {
    filename = path.normalize(filename);
    return (filename.substr(0, root.length) === root);
}

// Resolve paths in a specific folder
// Throw error if file is outside this folder
function resolveInRoot(root) {
    var input, result, err;

    input = _.chain(arguments)
        .toArray()
        .slice(1)
        .reduce(function(current, p) {
            // Handle path relative to book root ("/README.md")
            if (p[0] == "/" || p[0] == "\\") return p.slice(1);

            return current? path.join(current, p) : path.normalize(p);
        }, "")
        .value();

    result = path.resolve(root, input);

    if (!isInRoot(root, result)) {
        err = new Error("EACCESS: \"" + result + "\" not in \"" + root + "\"");
        err.code = "EACCESS";
        throw err;
    }

    return result;
}

module.exports = {
    isInRoot: isInRoot,
    resolveInRoot: resolveInRoot
};
