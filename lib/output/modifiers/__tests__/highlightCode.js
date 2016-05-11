var cheerio = require('cheerio');
var Promise = require('../../../utils/promise');
var highlightCode = require('../highlightCode');

describe('highlightCode', function() {
    function doHighlight(lang, code) {
        return {
            text: '' + (lang || '') + '$' + code
        };
    }

    function doHighlightAsync(lang, code) {
        return Promise()
        .then(function() {
            return doHighlight(lang, code);
        });
    }

    it('should call it for normal code element', function() {
        var $ = cheerio.load('<p>This is a <code>test</code></p>');

        return highlightCode(doHighlight, $)
        .then(function() {
            var $code = $('code');
            expect($code.text()).toBe('$test');
        });
    });

    it('should call it for markdown code block', function() {
        var $ = cheerio.load('<pre><code class="lang-js">test</code></pre>');

        return highlightCode(doHighlight, $)
        .then(function() {
            var $code = $('code');
            expect($code.text()).toBe('js$test');
        });
    });

    it('should call it for asciidoc code block', function() {
        var $ = cheerio.load('<pre><code class="language-python">test</code></pre>');

        return highlightCode(doHighlight, $)
        .then(function() {
            var $code = $('code');
            expect($code.text()).toBe('python$test');
        });
    });

    it('should accept async highlighter', function() {
        var $ = cheerio.load('<pre><code class="language-python">test</code></pre>');

        return highlightCode(doHighlightAsync, $)
        .then(function() {
            var $code = $('code');
            expect($code.text()).toBe('python$test');
        });
    });
});


