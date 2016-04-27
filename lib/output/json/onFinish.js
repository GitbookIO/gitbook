var Promise = require('../../utils/promise');

/**
    Finish the generation

    @param {Output}
    @return {Output}
*/
function onFinish(output) {
    // todo: copy README.json from main language

    return Promise(output);
}

module.exports = onFinish;
