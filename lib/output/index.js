var Immutable = require('immutable');

var generators = Immutable.List([
    require('./json'),
    require('./website'),
    require('./ebook')
]);

/**
    Return a specific generator by its name

    @param {String}
    @return {Generator}
*/
function getGenerator(name) {
    return generators.find(function(generator) {
        return generator.name == name;
    });
}

module.exports = {
    generate:           require('./generateBook'),
    getGenerator:       getGenerator
};
