var Promise = require('../../utils/promise');

/**
    Initialize the generator

    @param {Output}
    @return {Output}
*/
function onFinish(output) {
    return Promise(output);
}

module.exports = onFinish;
