var Config = require('../models/config');

/**
    Decode changes from a JS API to a config object

    @param {Config} config
    @param {Object} result: result from API
    @return {Config}
*/
function decodeGlobal(config, result) {
    var values = result.values;
    return Config.updateValues(config, values);
}

module.exports = decodeGlobal;
