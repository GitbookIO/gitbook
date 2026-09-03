import { describe, expect, it } from 'bun:test';

import { getExtension, removeMarkdownExtension } from './paths';

describe('getExtension', () => {
    it('should return the extension of a path', () => {
        expect(getExtension('test.txt')).toBe('.txt');
    });

    it('should return an empty string if there is no extension', () => {
        expect(getExtension('test/path/to/file')).toBe('');
    });

    it('should return the extension of a path with multiple dots', () => {
        expect(getExtension('test.with.multiple.dots.txt')).toBe('.txt');
    });
});

describe('removeMarkdownExtension', () => {
    it('should remove a trailing .md extension', () => {
        expect(removeMarkdownExtension('getting-started.md')).toBe('getting-started');
        expect(removeMarkdownExtension('/guides/installation.md')).toBe('/guides/installation');
    });

    it('should leave other paths untouched', () => {
        expect(removeMarkdownExtension('getting-started')).toBe('getting-started');
        expect(removeMarkdownExtension('md-files')).toBe('md-files');
        expect(removeMarkdownExtension('notes.md.html')).toBe('notes.md.html');
        expect(removeMarkdownExtension('')).toBe('');
    });
});
