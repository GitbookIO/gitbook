var Logger = require('../utils/logger');

var logOptions = {
    name: 'log',
    description: 'Minimum log level to display',
    values: Object.keys(Logger.LEVELS)
        .map(function(s) {
            return s.toLowerCase();
        }),
    defaults: 'info'
};

var formatOption = {
    name: 'format',
    description: 'Format to build to',
    values: ['website', 'json', 'ebook'],
    defaults: 'website'
};

module.exports = {
    log: logOptions,
    format: formatOption
};
