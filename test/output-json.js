var mock = require('./mock');

describe('JSON Output', function() {
    it('should correctly generate a default book', function() {
        return mock.outputDefaultBook('json');
    });
});

