const { OrderedMap } = require('immutable');

const parseURIIndexFromPages = require('../parseURIIndexFromPages');
const Page = require('../../models/page');

describe('parseURIIndexFromPages', () => {

    it('should map file to html', () => {
        const pages = OrderedMap({
            'page.md': new Page()
        });
        const urls = parseURIIndexFromPages(pages);

        expect(urls.resolve('page.md')).toBe('page.html');
    });

    it('should map README to folder', () => {
        const pages = OrderedMap({
            'hello/README.md': new Page()
        });
        const urls = parseURIIndexFromPages(pages);

        expect(urls.resolveToURL('hello/README.md')).toBe('hello/');
    });

});
