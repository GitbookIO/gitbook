var buildEbook = require('./buildEbook');

module.exports = [
    require('./build'),
    require('./serve'),
    require('./install'),
    require('./parse'),
    require('./init'),
    buildEbook('pdf'),
    buildEbook('epub'),
    buildEbook('mobi')
];
