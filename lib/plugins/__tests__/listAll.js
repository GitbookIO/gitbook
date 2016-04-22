jest.autoMockOff();

describe('listAll', function() {
    var listAll = require('../listAll');

    it('must list from string', function() {
        var plugins = listAll('ga,great');

        expect(plugins.size).toBe(8);

        expect(plugins.has('ga')).toBe(true);
        expect(plugins.has('great')).toBe(true);

        expect(plugins.has('search')).toBe(true);
    });

    it('must list from array', function() {
        var plugins = listAll(['ga', 'great']);

        expect(plugins.size).toBe(8);

        expect(plugins.has('ga')).toBe(true);
        expect(plugins.has('great')).toBe(true);

        expect(plugins.has('search')).toBe(true);
    });

    it('must parse version (semver)', function() {
        var plugins = listAll(['ga@1.0.0', 'great@>=4.0.0']);

        expect(plugins.has('ga')).toBe(true);
        expect(plugins.has('great')).toBe(true);

        var ga = plugins.get('ga');
        expect(ga.getVersion()).toBe('1.0.0');

        var great = plugins.get('great');
        expect(great.getVersion()).toBe('>=4.0.0');
    });

    it('must parse version (git)', function() {
        var plugins = listAll(['ga@git+https://github.com/GitbookIO/plugin-ga.git', 'great@git+ssh://samy@github.com/GitbookIO/plugin-ga.git']);

        expect(plugins.has('ga')).toBe(true);
        expect(plugins.has('great')).toBe(true);

        var ga = plugins.get('ga');
        expect(ga.getVersion()).toBe('git+https://github.com/GitbookIO/plugin-ga.git');

        var great = plugins.get('great');
        expect(great.getVersion()).toBe('git+ssh://samy@github.com/GitbookIO/plugin-ga.git');
    });

});
