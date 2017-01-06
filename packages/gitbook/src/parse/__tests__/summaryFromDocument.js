const expect = require('expect');
const readDocument = require('./utils/readDocument');
const summaryFromDocument = require('../summaryFromDocument');

function readSummary(filename) {
    const document = readDocument(filename);
    return summaryFromDocument(document);
}

describe('summaryFromDocument', () => {

    it('should parse from a UL', () => {
        const summary = readSummary('summary/ul.yaml');
        expect(summary.parts.size).toBe(1);

        const first = summary.getByLevel('1.1');
        expect(first).toExist();
        expect(first.title).toBe('Hello');

        const last = summary.getByLevel('1.2');
        expect(last).toExist();
        expect(last.title).toBe('World');
    });

    it('should parse from a UL with links', () => {
        const summary = readSummary('summary/ul-with-link.yaml');
        const first = summary.getByLevel('1.1');

        expect(first).toExist();
        expect(first.title).toBe('Hello');
        expect(first.ref).toBe('hello.md');
    });

    it('should parse multiple parts', () => {
        const summary = readSummary('summary/parts-ul.yaml');
        expect(summary.parts.size).toBe(2);

        const first = summary.getByLevel('1.1');
        expect(first).toExist();
        expect(first.title).toBe('Hello');

        const last = summary.getByLevel('2.1');
        expect(last).toExist();
        expect(last.title).toBe('World');
    });

});
