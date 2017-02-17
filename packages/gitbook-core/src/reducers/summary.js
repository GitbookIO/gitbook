const StateSummary = require('../models/StateSummary');


module.exports = (state, action) => {
    return StateSummary.create(state);
};
