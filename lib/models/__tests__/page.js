var Immutable = require('immutable');
var Page = require('../page');

describe('Page', function() {

    describe('toText', function() {
        it('must not prepend frontmatter if no attributes', function() {
            var page = Page().merge({
                content: 'Hello World'
            });

            expect(page.toText()).toBe('Hello World');
        });

        it('must prepend frontmatter if attributes', function() {
            var page = Page().merge({
                content: 'Hello World',
                attributes: Immutable.fromJS({
                    hello: 'world'
                })
            });

            expect(page.toText()).toBe('---\nhello: world\n---\n\nHello World');
        });
    });
});


