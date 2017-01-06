const expect = require('expect');
const readDocument = require('./utils/readDocument');
const languagesFromDocument = require('../languagesFromDocument');

function readLanguages(filename) {
    const document = readDocument(filename);
    return languagesFromDocument(document);
}

describe('languagesFromDocument', () => {

    it('should parse empty', () => {
        const languages = readLanguages('languages/empty.yaml');
        expect(languages.getCount()).toBe(0);
    });

    it('should parse ul list', () => {
        const languages = readLanguages('languages/ul.yaml');
        expect(languages.getCount()).toBe(0);
    });

    it('should parse ul list with links', () => {
        const languages = readLanguages('languages/ul-with-link.yaml');
        expect(languages.getCount()).toBe(2);

        const first = languages.list.first();
        const second = languages.list.last();

        expect(first.title).toBe('English');
        expect(first.path).toBe('en/');

        expect(second.title).toBe('French');
        expect(second.path).toBe('fr/');
    });

});
