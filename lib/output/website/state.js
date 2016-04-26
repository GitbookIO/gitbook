var I18n = require('i18n-t');
var Immutable = require('immutable');

var GeneratorState = Immutable.Record({
    i18n:       I18n()
});

GeneratorState.prototype.getI18n = function() {
    return this.get('i18n');
};

module.exports = GeneratorState;
