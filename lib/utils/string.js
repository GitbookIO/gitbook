var _ = require("lodash");

function escapeShellArg(arg) {
    var ret = '';

    ret = arg.replace(/"/g, '\\"');

    return "\"" + ret + "\"";
}

function optionsToShellArgs(options) {
    return _.chain(options)
    .map(function(value, key) {
        if (value == null || value === false) return null;
        if (value === true) return key;
        return key+"="+escapeShellArg(value);
    })
    .compact()
    .value()
    .join(" ");
}

module.exports = {
    escapeShellArg: escapeShellArg,
    optionsToShellArgs: optionsToShellArgs
};
