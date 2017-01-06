const Promise = require('../utils/promise');
const timing = require('../utils/timing');
const Api = require('../api');

function defaultGetArgument() {
    return undefined;
}

function defaultHandleResult(output, result) {
    return output;
}

/**
 * Call a "global" hook for an output. Hooks are functions exported by plugins.
 *
 * @param {String} name
 * @param {Function(Output) -> Mixed} getArgument
 * @param {Function(Output, result) -> Output} handleResult
 * @param {Output} output
 * @return {Promise<Output>}
 */
function callHook(name, getArgument, handleResult, output) {
    getArgument = getArgument || defaultGetArgument;
    handleResult = handleResult || defaultHandleResult;

    const logger = output.getLogger();
    const plugins = output.getPlugins();

    logger.debug.ln('calling hook "' + name + '"');

    // Create the JS context for plugins
    const context = Api.encodeGlobal(output);

    return timing.measure(
        'call.hook.' + name,

        // Get the arguments
        Promise(getArgument(output))

        // Call the hooks in serie
        .then((arg) => {
            return Promise.reduce(plugins, (prev, plugin) => {
                const hook = plugin.getHook(name);
                if (!hook) {
                    return prev;
                }

                return hook.call(context, prev);
            }, arg);
        })

        // Handle final result
        .then((result) => {
            output = Api.decodeGlobal(output, context);
            return handleResult(output, result);
        })
    );
}

module.exports = callHook;
