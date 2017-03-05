const AsciidocParser = require('../asciidoc');

describe('AsciidocParser', () => {

    it('should use font icons by default', () => {
        const result = AsciidocParser.toHTML('= GitBook User Manual\n\n== Install\n\nIMPORTANT: Do not forgot to install `yarn`');
        expect(result).toMatch(/fa icon-important/);
    });

    it('should allow users to override icons attribute', () => {
        const result = AsciidocParser.toHTML('= GitBook User Manual\n:icons:\n== Install\n\nIMPORTANT: Do not forgot to install `yarn`');
        expect(result).toNotMatch(/fa icon-important/);
    });
});
