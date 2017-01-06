const expect = require('expect');
const readDocument = require('./utils/readDocument');
const glossaryFromDocument = require('../glossaryFromDocument');

function readGlossary(filename) {
    const document = readDocument(filename);
    return glossaryFromDocument(document);
}

describe('glossaryFromDocument', () => {

    it('should parse empty', () => {
        const glossary = readGlossary('glossary/empty.yaml');
        expect(glossary.entries.size).toBe(0);
    });

    it('should parse one entry without description', () => {
        const glossary = readGlossary('glossary/one-entry.yaml');
        expect(glossary.entries.size).toBe(1);

        const entry = glossary.entries.first();

        expect(entry.name).toBe('An entry');
        expect(entry.description).toBe('');
    });

});
