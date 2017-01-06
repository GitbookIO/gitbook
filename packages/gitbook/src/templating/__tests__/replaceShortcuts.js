const Immutable = require('immutable');

const TemplateBlock = require('../../models/templateBlock');
const replaceShortcuts = require('../replaceShortcuts');

describe('replaceShortcuts', () => {
    const blocks = Immutable.List([
        TemplateBlock.create('math', {
            shortcuts: {
                start: '$$',
                end: '$$',
                parsers: ['markdown']
            }
        })
    ]);

    it('should correctly replace inline matches by block', () => {
        const content = replaceShortcuts(blocks, 'test.md', 'Hello $$a = b$$');
        expect(content).toBe('Hello {% math %}a = b{% endmath %}');
    });

    it('should correctly replace multiple inline matches by block', () => {
        const content = replaceShortcuts(blocks, 'test.md', 'Hello $$a = b$$ and $$c = d$$');
        expect(content).toBe('Hello {% math %}a = b{% endmath %} and {% math %}c = d{% endmath %}');
    });

    it('should correctly replace block matches', () => {
        const content = replaceShortcuts(blocks, 'test.md', 'Hello\n$$\na = b\n$$\n');
        expect(content).toBe('Hello\n{% math %}\na = b\n{% endmath %}\n');
    });
});
