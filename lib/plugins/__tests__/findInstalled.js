var path = require('path');

describe('findInstalled', function() {
    var findInstalled = require('../findInstalled');

    pit('must list default plugins for gitbook directory', function() {
        return findInstalled(path.resolve(__dirname, '../../../'))
        .then(function(plugins) {
            expect(plugins.size > 6).toBeTruthy();

            expect(plugins.has('fontsettings')).toBe(true);
            expect(plugins.has('search')).toBe(true);
        });
    });

});
