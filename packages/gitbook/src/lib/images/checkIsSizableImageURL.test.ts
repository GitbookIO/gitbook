import { describe, expect, it } from 'bun:test';
import { SizableImageAction, checkIsSizableImageURL } from './checkIsSizableImageURL';

describe('checkIsSizableImageURL', () => {
    it('should return Skip for non-parsable URLs', () => {
        expect(checkIsSizableImageURL('not a url')).toBe(SizableImageAction.Skip);
    });

    it('should return Skip for non-http(s) URLs', () => {
        expect(checkIsSizableImageURL('data:image/png;base64,abc')).toBe(SizableImageAction.Skip);
        expect(checkIsSizableImageURL('file:///path/to/image.jpg')).toBe(SizableImageAction.Skip);
    });

    it('should return Skip for localhost URLs', () => {
        expect(checkIsSizableImageURL('http://localhost:3000/image.jpg')).toBe(
            SizableImageAction.Skip
        );
        expect(checkIsSizableImageURL('https://localhost/image.png')).toBe(SizableImageAction.Skip);
    });

    it('should return Skip for GitBook image URLs', () => {
        expect(checkIsSizableImageURL('https://example.com/~gitbook/image/test.jpg')).toBe(
            SizableImageAction.Skip
        );
    });

    it('should return Resize for supported image extensions', () => {
        expect(checkIsSizableImageURL('https://example.com/image.jpg')).toBe(
            SizableImageAction.Resize
        );
        expect(checkIsSizableImageURL('https://example.com/image.jpeg')).toBe(
            SizableImageAction.Resize
        );
        expect(checkIsSizableImageURL('https://example.com/image.png')).toBe(
            SizableImageAction.Resize
        );
        expect(checkIsSizableImageURL('https://example.com/image.gif')).toBe(
            SizableImageAction.Resize
        );
        expect(checkIsSizableImageURL('https://example.com/image.webp')).toBe(
            SizableImageAction.Resize
        );
    });

    it('should return Resize for URLs without extensions', () => {
        expect(checkIsSizableImageURL('https://example.com/image')).toBe(SizableImageAction.Resize);
    });

    it('should return Passthrough for unsupported image extensions', () => {
        expect(checkIsSizableImageURL('https://example.com/image.svg')).toBe(
            SizableImageAction.Passthrough
        );
        expect(checkIsSizableImageURL('https://example.com/image.bmp')).toBe(
            SizableImageAction.Passthrough
        );
        expect(checkIsSizableImageURL('https://example.com/image.tiff')).toBe(
            SizableImageAction.Passthrough
        );
        expect(checkIsSizableImageURL('https://example.com/image.ico')).toBe(
            SizableImageAction.Passthrough
        );
    });

    it('should handle URLs with query parameters correctly', () => {
        expect(checkIsSizableImageURL('https://example.com/image.jpg?width=100')).toBe(
            SizableImageAction.Resize
        );
        expect(checkIsSizableImageURL('https://example.com/image.svg?height=200')).toBe(
            SizableImageAction.Passthrough
        );
    });

    it('should be case-insensitive for extensions', () => {
        expect(checkIsSizableImageURL('https://example.com/image.JPG')).toBe(
            SizableImageAction.Resize
        );
        expect(checkIsSizableImageURL('https://example.com/image.PNG')).toBe(
            SizableImageAction.Resize
        );
    });
});
