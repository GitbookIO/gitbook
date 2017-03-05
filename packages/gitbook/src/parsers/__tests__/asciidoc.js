const AsciidocParser = require('../asciidoc');

describe('AsciidocParser', () => {

    it('should convert to HTML with user-defined attributes', () => {
        const context = {
            config: {
                pluginsConfig: {
                    asciidoc: {
                        attributes: ["gitbook-install-version=4.0.0"]
                    }
                }
            }
        };
        const result = AsciidocParser.toHTML('= GitBook User Manual\n\n== Install\n\nTo install GitBook version {gitbook-install-version}...', context);
        expect(result).toMatch(/GitBook version 4\.0\.0/);
    });
});
