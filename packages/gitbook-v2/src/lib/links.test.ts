import { describe, expect, it } from 'bun:test';
import { createLinker } from './links';

const root = createLinker({
    host: 'docs.company.com',
    spaceBasePath: '/',
    siteBasePath: '/',
});

const variantInSection = createLinker({
    host: 'docs.company.com',
    spaceBasePath: '/section/variant',
    siteBasePath: '/',
});

const siteGitBookIO = createLinker({
    host: 'org.gitbook.io',
    spaceBasePath: '/sitename/variant/',
    siteBasePath: '/sitename/',
});

describe('toPathInContent', () => {
    it('should return the correct path', () => {
        expect(root.toPathInSpace('some/path')).toBe('/some/path');
        expect(variantInSection.toPathInSpace('some/path')).toBe('/section/variant/some/path');
    });

    it('should handle leading slash', () => {
        expect(root.toPathInSpace('/some/path')).toBe('/some/path');
        expect(variantInSection.toPathInSpace('/some/path')).toBe('/section/variant/some/path');
    });
});

describe('toPathInSite', () => {
    it('should return the correct path', () => {
        expect(root.toPathInSite('some/path')).toBe('/some/path');
        expect(siteGitBookIO.toPathInSite('some/path')).toBe('/sitename/some/path');
    });
});

describe('toRelativePathInSite', () => {
    it('should return the correct path', () => {
        expect(root.toRelativePathInSite('/some/path')).toBe('some/path');
        expect(siteGitBookIO.toRelativePathInSite('/sitename/some/path')).toBe('some/path');
    });

    it('should preserve absolute paths outside of the site', () => {
        expect(siteGitBookIO.toRelativePathInSite('/outside/some/path')).toBe('/outside/some/path');
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

describe('toLinkForContent', () => {
    it('should return the correct path', () => {
        expect(root.toLinkForContent('https://docs.company.com/some/path')).toBe('/some/path');
        expect(siteGitBookIO.toLinkForContent('https://org.gitbook.io/sitename/some/path')).toBe(
            '/sitename/some/path'
        );
    });

    it('should preserve an absolute URL if the site is not the same', () => {
        expect(siteGitBookIO.toLinkForContent('https://org.gitbook.io/anothersite/some/path')).toBe(
            'https://org.gitbook.io/anothersite/some/path'
        );
    });
});
