var Immutable = require('immutable');
var cheerio = require('cheerio');
var GlossaryEntry = require('../../../models/glossaryEntry');
var annotateText = require('../annotateText');

describe('annotateText', function() {
    var entries = Immutable.List([
        GlossaryEntry({ name: 'Word' }),
        GlossaryEntry({ name: 'Multiple Words' })
    ]);

    it('should annotate text', function() {
        var $ = cheerio.load('<p>This is a word, and multiple words</p>');

        annotateText(entries, 'GLOSSARY.md', $);

        var links = $('a');
        expect(links.length).toBe(2);

        var word = $(links.get(0));
        expect(word.attr('href')).toBe('/GLOSSARY.md#word');
        expect(word.text()).toBe('word');
        expect(word.hasClass('glossary-term')).toBeTruthy();

        var words = $(links.get(1));
        expect(words.attr('href')).toBe('/GLOSSARY.md#multiple-words');
        expect(words.text()).toBe('multiple words');
        expect(words.hasClass('glossary-term')).toBeTruthy();
    });

    it('should not annotate scripts', function() {
        var $ = cheerio.load('<script>This is a word, and multiple words</script>');

        annotateText(entries, 'GLOSSARY.md', $);
        expect($('a').length).toBe(0);
    });

    it('should not annotate when has class "no-glossary"', function() {
        var $ = cheerio.load('<p class="no-glossary">This is a word, and multiple words</p>');

        annotateText(entries, 'GLOSSARY.md', $);
        expect($('a').length).toBe(0);
    });
});


