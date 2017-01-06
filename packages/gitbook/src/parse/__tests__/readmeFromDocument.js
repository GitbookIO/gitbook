const expect = require('expect');
const readDocument = require('./utils/readDocument');
const readmeFromDocument = require('../readmeFromDocument');

function readReadme(filename) {
    const document = readDocument(filename);
    return readmeFromDocument(document);
}

describe('readmeFromDocument', () => {

    it('should parse only title', () => {
        const readme = readReadme('readme/only-title.yaml');
        expect(readme.title).toBe('Hello World');
        expect(readme.description).toBe('');
    });

    it('should parse title and description', () => {
        const readme = readReadme('readme/normal.yaml');
        expect(readme.title).toBe('Hello World');
        expect(readme.description).toBe('This is a description');
    });

});
