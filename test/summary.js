var fs = require('fs');
var path = require('path');
var assert = require('assert');

var summary = require('../').parse.summary;


describe('Summary parsing', function () {

    var CONTENT = fs.readFileSync(path.join(__dirname, './fixtures/SUMMARY.md'), 'utf8');
    var LEXED = summary(CONTENT);

    it('should detect chapters', function() {
        assert.equal(LEXED.chapters.length, 5);
    });

    it('should support articles', function() {
        assert.equal(LEXED.chapters[0].articles.length, 2);
        assert.equal(LEXED.chapters[1].articles.length, 0);
        assert.equal(LEXED.chapters[2].articles.length, 0);
    });

    it('should detect paths and titles', function() {
        assert(LEXED.chapters[0].path);
        assert(LEXED.chapters[1].path);
        assert(LEXED.chapters[2].path);
        assert(LEXED.chapters[3].path);
        assert.equal(LEXED.chapters[4].path, null);

        assert(LEXED.chapters[0].title);
        assert(LEXED.chapters[1].title);
        assert(LEXED.chapters[2].title);
        assert(LEXED.chapters[3].title);
        assert(LEXED.chapters[4].title);
    });

    it('should normalize paths from .md to .html', function() {
        assert.equal(LEXED.chapters[0].path,'chapter-1/README.md');
        assert.equal(LEXED.chapters[1].path,'chapter-2/README.md');
        assert.equal(LEXED.chapters[2].path,'chapter-3/README.md');
    });

    it('should detect levels correctly', function() {
        var c = LEXED.chapters;

        assert.equal(c[0].level, '1');
        assert.equal(c[1].level, '2');
        assert.equal(c[2].level, '3');

        assert.equal(c[0].articles[0].level, '1.1');
        assert.equal(c[0].articles[1].level, '1.2');
        assert.equal(c[0].articles[1].articles[0].level, '1.2.1');
    });
});

describe("Summary with parts, backwards compatibility", function () {

    var CONTENT = fs.readFileSync(path.join(__dirname, './fixtures/multi-part/SUMMARY.md'), 'utf8');
    var LEXED = summary(CONTENT);

    it('should detect parts as chapters', function() {
        assert.equal(LEXED.chapters.length, 3);
    });

    it('should expose part chapters as articles', function() {
        assert.equal(LEXED.chapters[0].articles.length, 5);
        assert.equal(LEXED.chapters[1].articles.length, 3);
        assert.equal(LEXED.chapters[2].articles.length, 5);
    });

    if ('should expose part chapter articles', function() {
        assert.equal(LEXED.chapters[0].articles[0].articles.length, 5);
        assert.equal(LEXED.chapters[0].articles[1].articles.length, 0);
        assert.equal(LEXED.chapters[0].articles[2].articles.length, 0);
    });

    it('should detect paths and titles', function() {
        assert.equal(LEXED.chapters[0].path, null);
        assert.equal(LEXED.chapters[1].path, null);
        assert(LEXED.chapters[2].path);

        assert(LEXED.chapters[0].articles[0].path);
        assert(LEXED.chapters[0].articles[1].path);
        assert(LEXED.chapters[0].articles[2].path);
        assert(LEXED.chapters[0].articles[3].path);
        assert.equal(LEXED.chapters[0].articles[4].path, null);

        assert.equal(LEXED.chapters[0].title, "Part I");
        assert.equal(LEXED.chapters[1].title, "Part II");
        assert.equal(LEXED.chapters[2].title, "Part III");

        assert(LEXED.chapters[0].articles[0].title);
        assert(LEXED.chapters[0].articles[1].title);
        assert(LEXED.chapters[0].articles[2].title);
        assert(LEXED.chapters[0].articles[3].title);
        assert(LEXED.chapters[0].articles[4].title);
    });

    it('should normalize paths from .md to .html', function() {
        assert.equal(LEXED.chapters[0].articles[0].path,'chapter-1/README.md');
        assert.equal(LEXED.chapters[0].articles[1].path,'chapter-2/README.md');
        assert.equal(LEXED.chapters[0].articles[2].path,'chapter-3/README.md');
        assert.equal(LEXED.chapters[2].path,'PART3.md');
    });

    it('should detect levels correctly', function() {
        var c = LEXED.chapters;

        assert.equal(c[0].level, '1');
        assert.equal(c[1].level, '2');
        assert.equal(c[2].level, '3');

        assert.equal(c[0].articles[0].level, '1.1');
        assert.equal(c[0].articles[0].articles[0].level, '1.1.1');
        assert.equal(c[0].articles[0].articles[1].level, '1.1.2');
        assert.equal(c[0].articles[0].articles[1].articles[0].level, '1.1.2.1');
    });});

describe('Summary with parts', function () {

    var CONTENT = fs.readFileSync(path.join(__dirname, './fixtures/multi-part/SUMMARY.md'), 'utf8');
    var LEXED = summary(CONTENT);

    it('should detect parts', function() {
        assert.equal(LEXED.parts.length, 3);
    });

    it('should expose chapters for each part', function() {
        assert.equal(LEXED.parts[0].chapters.length, 5);
        assert.equal(LEXED.parts[1].chapters.length, 3);
        assert.equal(LEXED.parts[2].chapters.length, 5);
    });

    it('should detect paths and titles for parts', function() {
        assert.equal(LEXED.parts[0].path, null);
        assert.equal(LEXED.parts[1].path, null);
        assert.equal(LEXED.parts[2].path, "PART3.md");

        assert.equal(LEXED.parts[0].title, "Part I");
        assert.equal(LEXED.parts[1].title, "Part II");
        assert.equal(LEXED.parts[2].title, "Part III");
    });

    it('should parse part paths', function() {
       assert.equal(LEXED.parts[0].path, null);
       assert.equal(LEXED.parts[1].path, null);
       assert.equal(LEXED.parts[2].path, "PART3.md");
    });

    it('should detect levels correctly', function() {
        assert.equal(LEXED.parts[0].level, "");
        assert.equal(LEXED.parts[1].level, "");
        assert.equal(LEXED.parts[2].level, "");

        assert.equal(LEXED.parts[0].chapters[0].level, '1');
        assert.equal(LEXED.parts[0].chapters[1].level, '2');
        assert.equal(LEXED.parts[0].chapters[2].level, '3');

        assert.equal(LEXED.parts[1].chapters[0].level, '1');
        assert.equal(LEXED.parts[1].chapters[1].level, '2');
        assert.equal(LEXED.parts[1].chapters[2].level, '3');

        assert.equal(LEXED.parts[2].chapters[0].level, '1');
        assert.equal(LEXED.parts[2].chapters[1].level, '2');
        assert.equal(LEXED.parts[2].chapters[2].level, '3');

        assert.equal(LEXED.parts[0].chapters[0].articles[0].level, '1.1');
        assert.equal(LEXED.parts[0].chapters[0].articles[1].level, '1.2');
        assert.equal(LEXED.parts[0].chapters[0].articles[1].articles[0].level, '1.2.1');
        assert.equal(LEXED.parts[0].chapters[0].articles[1].articles[1].level, '1.2.2');

        assert.equal(LEXED.parts[1].chapters[0].articles[0].level, '1.1');
        assert.equal(LEXED.parts[1].chapters[0].articles[1].level, '1.2');
        assert.equal(LEXED.parts[1].chapters[0].articles[1].articles[0].level, '1.2.1');
        assert.equal(LEXED.parts[1].chapters[0].articles[1].articles[1].level, '1.2.2');
    });
});