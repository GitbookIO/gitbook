const Readme = require('../models/Readme');

module.exports = (state, action) => {
    return Readme.create(state);
};
