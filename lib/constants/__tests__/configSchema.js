var jsonschema = require('jsonschema');
var schema = require('../configSchema');

describe('configSchema', function() {

    function validate(cfg) {
        var v = new jsonschema.Validator();
        return v.validate(cfg, schema, {
            propertyName: 'config'
        });
    }

    describe('structure', function() {

        it('should accept dot in filename', function() {
            var result = validate({
                structure: {
                    readme: 'book-intro.adoc'
                }
            });

            expect(result.errors.length).toBe(0);
        });

    });
});
