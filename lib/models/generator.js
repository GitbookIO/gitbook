var Immutable = require('immutable');

var Generator = Immutable.Record({
    name:       String()
});



Generator.create = function(def) {
    return new Generator(def);
};

module.exports = Generator;
