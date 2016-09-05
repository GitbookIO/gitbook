const Immutable = require('immutable');

const TemplateBlock = require('../../models/templateBlock');
const replaceShortcuts = require('../replaceShortcuts');

describe('replaceShortcuts', function() {
    const blocks = Immutable.List([
        TemplateBlock.create('math', {
            shortcuts: {
                start: '$$',
                end: '$$',
                parsers: ['markdown']
            }
        })
    ]);

    it('should correctly replace inline matches by block', function() {
        const content = replaceShortcuts(blocks, 'test.md', 'Hello $$a = b$$');
        expect(content).toBe('Hello {% math %}a = b{% endmath %}');
    });

    it('should correctly replace block matches', function() {
        const content = replaceShortcuts(blocks, 'test.md', 'Hello\n$$\na = b\n$$\n');
        expect(content).toBe('Hello\n{% math %}\na = b\n{% endmath %}\n');
    });
});

