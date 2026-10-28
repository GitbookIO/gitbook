import { describe, expect, it } from 'bun:test';

import { json2xml } from './json2xml';

describe('getUrlFromServerState', () => {
    it('transforms JSON to xml', () => {
        const xml = json2xml({
            foo: 'bar',
        });

        expect(xml).toBe('<?xml version="1.0"?>\n<foo>bar</foo>\n');
    });

    it('wraps array items', () => {
        const xml = json2xml({
            urls: {
                url: ['https://example.com', 'https://example.com'],
            },
        });

        expect(xml).toBe(
            '<?xml version="1.0"?>\n<urls>\n\t<url>https://example.com</url>\n\t<url>https://example.com</url>\n</urls>\n'
        );
    });

    it('indents correctly', () => {
        const xml = json2xml({
            id: 10,
            name: 'doggie',
            category: {
                id: 1,
                name: 'Dogs',
            },
            photoUrls: ['string'],
            tags: [
                {
                    id: 0,
                    name: 'string',
                },
            ],
            status: 'available',
        });

        expect(xml).toMatchSnapshot();
    });
});
