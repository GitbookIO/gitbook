const expect = require('expect');
const read = require('read-metadata');
const { Raw } = require('slate');
const summaryFromDocument = require('../fromDocument');

function readSummary(filename) {
    const yaml = read.sync(filename);
    const { document } = Raw.deserializeState(yaml, { terse: true });

    return summaryFromDocument(document);
}

describe.only('summaryFromDocument', () => {

    it('should parse from a UL', () => {
        const summary = readSummary(__dirname + '/fixtures/ul.yaml');
        expect(summary.parts.size).toBe(1);

        const first = summary.getByLevel('1.1');
        expect(first).toExist();
        expect(first.title).toBe('Hello');

        const last = summary.getByLevel('1.2');
        expect(last).toExist();
        expect(last.title).toBe('World');
    });

    it('should parse from a UL with links', () => {
        const summary = readSummary(__dirname + '/fixtures/ul-with-link.yaml');
        expect(summary.parts.size).toBe(1);

        const first = summary.getByLevel('1.1');
        expect(first).toExist();
        expect(first.title).toBe('Hello');
        expect(first.ref).toBe('hello.md');
    });

});
