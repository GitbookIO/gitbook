const AsciidocParser = require('../asciidoc');

describe('AsciidocParser', () => {

    it('should convert to HTML and include file', () => {
        const result = AsciidocParser.toHTML('= GitBook User Manual\n\n== Usage\n\ninclude::src/parsers/__tests__/usage.adoc[]');
        expect(result).toMatch(/To use GitBook/);
    });
});
