var should = require('should');
var git = require('../lib/utils/git');

describe('Git', function() {

    describe('URL parsing', function() {

        it('should correctly validate git urls', function() {
            // HTTPS
            git.isUrl('git+https://github.com/Hello/world.git').should.be.ok;

            // SSH
            git.isUrl('git+git@github.com:GitbookIO/gitbook.git/directory/README.md#e1594cde2c32e4ff48f6c4eff3d3d461743d74e1').should.be.ok;

            // Non valid
            git.isUrl('https://github.com/Hello/world.git').should.not.be.ok;
            git.isUrl('README.md').should.not.be.ok;
        });

        it('should parse HTTPS urls', function() {
            var parts = git.parseUrl('git+https://gist.github.com/69ea4542e4c8967d2fa7.git/test.md');

            should.exist(parts);
            parts.host.should.be.equal('https://gist.github.com/69ea4542e4c8967d2fa7.git');
            parts.ref.should.be.equal('master');
            parts.filepath.should.be.equal('test.md');
        });

        it('should parse HTTPS urls with a reference', function() {
            var parts = git.parseUrl('git+https://gist.github.com/69ea4542e4c8967d2fa7.git/test.md#1.0.0');

            should.exist(parts);
            parts.host.should.be.equal('https://gist.github.com/69ea4542e4c8967d2fa7.git');
            parts.ref.should.be.equal('1.0.0');
            parts.filepath.should.be.equal('test.md');
        });

        it('should parse SSH urls', function() {
            var parts = git.parseUrl('git+git@github.com:GitbookIO/gitbook.git/directory/README.md#e1594cde2c32e4ff48f6c4eff3d3d461743d74e1');

            should.exist(parts);
            parts.host.should.be.equal('git@github.com:GitbookIO/gitbook.git');
            parts.ref.should.be.equal('e1594cde2c32e4ff48f6c4eff3d3d461743d74e1');
            parts.filepath.should.be.equal('directory/README.md');
        });
    });

});
