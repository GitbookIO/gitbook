const Immutable = require('immutable');
const cheerio = require('cheerio');
const GlossaryEntry = require('../../../models/glossaryEntry');
const annotateText = require('../annotateText');

describe('annotateText', () => {
    const entries = Immutable.List([
        new GlossaryEntry({ name: 'Word' }),
        new GlossaryEntry({ name: 'Multiple Words' })
    ]);

    it('should annotate text', () => {
        const $ = cheerio.load('<p>This is a word, and multiple words</p>');

        annotateText(entries, 'GLOSSARY.md', $);

        const links = $('a');
        expect(links.length).toBe(2);

        const word = $(links.get(0));
        expect(word.attr('href')).toBe('/GLOSSARY.md#word');
        expect(word.text()).toBe('word');
        expect(word.hasClass('glossary-term')).toBeTruthy();

        const words = $(links.get(1));
        expect(words.attr('href')).toBe('/GLOSSARY.md#multiple-words');
        expect(words.text()).toBe('multiple words');
        expect(words.hasClass('glossary-term')).toBeTruthy();
    });

    it('should not annotate scripts', () => {
        const $ = cheerio.load('<script>This is a word, and multiple words</script>');

        annotateText(entries, 'GLOSSARY.md', $);
        expect($('a').length).toBe(0);
    });

    it('should not annotate when has class "no-glossary"', () => {
        const $ = cheerio.load('<p class="no-glossary">This is a word, and multiple words</p>');

        annotateText(entries, 'GLOSSARY.md', $);
        expect($('a').length).toBe(0);
    });
});
