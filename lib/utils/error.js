var _ = require('lodash');

// Enforce as an Error object, and cleanup message
function enforce(err) {
    if (_.isString(err)) err = new Error(err);
    err.message = err.message.replace(/^Error: /, '');

    return err;
}

module.exports = {
    enforce: enforce
};
