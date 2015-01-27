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

function escapeRegex(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

module.exports = {
    escapeRegex: escapeRegex,
    escapeShellArg: escapeShellArg,
    optionsToShellArgs: optionsToShellArgs,
    toLowerCase: String.prototype.toLowerCase.call.bind(String.prototype.toLowerCase)
};
