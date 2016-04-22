var Promise = require('../utils/promise');

function defaultGetArgument() {
    return undefined;
}

function defaultHandleResult(output, result) {
    return output;
}

/**
    Call a "global" hook for an output

    @param {String} name
    @param {Function(Output) -> Mixed} getArgument
    @param {Function(Output, result) -> Output} handleResult
    @param {Output} output
    @return {Promise<Output>}
*/
function callHook(name, getArgument, handleResult, output) {
    getArgument = getArgument || defaultGetArgument;
    handleResult = handleResult || defaultHandleResult;

    var plugins = output.getPlugins();

    return Promise(getArgument(output))
    .then(function(arg) {
        return Promise.reduce(plugins, function(prev, plugin) {
            var hook = plugin.getHook(name);

            return hook(prev);
        }, arg);
    })
    .then(function(result) {
        return handleResult(output, result);
    });
}

module.exports = callHook;
