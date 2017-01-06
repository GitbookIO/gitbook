const Immutable = require('immutable');
const Page = require('../page');

describe('Page', () => {

    describe('toText', () => {
        it('must not prepend frontmatter if no attributes', () => {
            const page = (new Page()).merge({
                content: 'Hello World'
            });

            expect(page.toText()).toBe('Hello World');
        });

        it('must prepend frontmatter if attributes', () => {
            const page = (new Page()).merge({
                content: 'Hello World',
                attributes: Immutable.fromJS({
                    hello: 'world'
                })
            });

            expect(page.toText()).toBe('---\nhello: world\n---\n\nHello World');
        });
    });
});
