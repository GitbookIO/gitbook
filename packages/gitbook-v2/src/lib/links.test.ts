import { describe, expect, it } from 'bun:test';
import { appendBasePathToLinker, createLinker } from './links';

const root = createLinker({
    host: 'docs.company.com',
    pathname: '/',
});

const variantInSection = createLinker({
    host: 'docs.company.com',
    pathname: '/section/variant',
});

describe('toPathInContent', () => {
    it('should return the correct path', () => {
        expect(root.toPathInContent('some/path')).toBe('/some/path');
        expect(variantInSection.toPathInContent('some/path')).toBe('/section/variant/some/path');
    });

    it('should handle leading slash', () => {
        expect(root.toPathInContent('/some/path')).toBe('/some/path');
        expect(variantInSection.toPathInContent('/some/path')).toBe('/section/variant/some/path');
    });
});

describe('toAbsoluteURL', () => {
    it('should return the correct path', () => {
        expect(root.toAbsoluteURL('some/path')).toBe('https://docs.company.com/some/path');
        expect(variantInSection.toAbsoluteURL('some/path')).toBe(
            'https://docs.company.com/some/path'
        );
    });
});

describe('appendBasePathToLinker', () => {
    const prefixedRoot = appendBasePathToLinker(root, '/section/variant');
    const prefixedVariantInSection = appendBasePathToLinker(variantInSection, '/base');

    describe('toPathInContent', () => {
        it('should return the correct path', () => {
            expect(prefixedRoot.toPathInContent('some/path')).toBe('/section/variant/some/path');
            expect(prefixedVariantInSection.toPathInContent('some/path')).toBe(
                '/section/variant/base/some/path'
            );
        });
    });

    describe('toAbsoluteURL', () => {
        it('should return the correct path', () => {
            expect(prefixedRoot.toAbsoluteURL('some/path')).toBe(
                'https://docs.company.com/some/path'
            );
            expect(prefixedVariantInSection.toAbsoluteURL('some/path')).toBe(
                'https://docs.company.com/some/path'
            );
        });
    });
});
