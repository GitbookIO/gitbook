/**
    Encode configuration to JSON

    @param {Config}
    @return {Object}
*/
function encodeConfig(config) {
    var values = config.getValues();
    return values.toJS();
}

module.exports = encodeConfig;
