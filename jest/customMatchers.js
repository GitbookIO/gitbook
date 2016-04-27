var path = require('path');
var fs = require('fs');

var matchers = {
    /**
        Verify that a file exists in a directory
    */
    toHaveFile: function () {
        return {
            compare: function (actual, expected) {
                var filePath = path.join(actual, expected);
                var exists = fs.existsSync(filePath);

                return {
                    pass: exists
                };
            }
        };
    }
};

jasmine.getEnv().beforeEach(function () {
    jasmine.addMatchers(matchers);
});