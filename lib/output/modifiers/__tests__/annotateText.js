var Immutable = require('immutable');
var cheerio = require('cheerio');
var GlossaryEntry = require('../../../models/glossaryEntry');
var annotateText = require('../annotateText');

describe('annotateText', function() {
    var entries = Immutable.List([
        GlossaryEntry({ name: 'Word' }),
        GlossaryEntry({ name: 'Multiple Words' }),
        GlossaryEntry({ name: '中文关键词' }),
        GlossaryEntry({ name: '关键词 keyword' }),
        GlossaryEntry({ name: 'keyword 关键词' })
    ]);

    it('should annotate text', function() {
        var $ = cheerio.load('<p>This is a word, and multiple words</p><p>this is chinese character 这是一个中文关键词, and chinese character use with english: 这是一个混合关键词 keyword， or 这是一个混合keyword 关键词</p>');

        annotateText(entries, 'GLOSSARY.md', $);

        var links = $('a');
        expect(links.length).toBe(5);

        var word = $(links.get(0));
        expect(word.attr('href')).toBe('/GLOSSARY.md#word');
        expect(word.text()).toBe('word');
        expect(word.hasClass('glossary-term')).toBeTruthy();

        var words = $(links.get(1));
        expect(words.attr('href')).toBe('/GLOSSARY.md#multiple-words');
        expect(words.text()).toBe('multiple words');
        expect(words.hasClass('glossary-term')).toBeTruthy();

        var keyword = $(links.get(2));
        expect(keyword.attr('href')).toBe('/GLOSSARY.md#中文关键词');
        expect(keyword.text()).toBe('中文关键词');
        expect(keyword.hasClass('glossary-term')).toBeTruthy();

        var keywords = $(links.get(3));
        expect(keywords.attr('href')).toBe('/GLOSSARY.md#关键词-keyword');
        expect(keywords.text()).toBe('关键词 keyword');
        expect(keywords.hasClass('glossary-term')).toBeTruthy();

        var keywords2 = $(links.get(4));
        expect(keywords2.attr('href')).toBe('/GLOSSARY.md#keyword-关键词');
        expect(keywords2.text()).toBe('keyword 关键词');
        expect(keywords2.hasClass('glossary-term')).toBeTruthy();
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


