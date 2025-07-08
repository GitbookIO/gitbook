import { describe, expect, it } from 'bun:test';
import {
    createLinker,
    linkerForPublishedURL,
    linkerWithAbsoluteURLs,
    linkerWithOtherSpaceBasePath,
} from './links';

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

const preview = createLinker({
    host: 'preview',
    spaceBasePath: '/site_abc/section/space/',
    siteBasePath: '/site_abc/',
});

describe('toPathInSpace', () => {
    it('should return the correct path', () => {
        expect(root.toPathInSpace('some/path')).toBe('/some/path');
        expect(variantInSection.toPathInSpace('some/path')).toBe('/section/variant/some/path');
    });

    it('should handle leading slash', () => {
        expect(root.toPathInSpace('/some/path')).toBe('/some/path');
        expect(variantInSection.toPathInSpace('/some/path')).toBe('/section/variant/some/path');
    });

    it('should remove the trailing slash', () => {
        expect(root.toPathInSpace('some/path/')).toBe('/some/path');
        expect(variantInSection.toPathInSpace('some/path/')).toBe('/section/variant/some/path');
    });

    it('should not add an unnecessary trailing slash', () => {
        // The index page should not be an empty path
        expect(root.toPathInSpace('')).toBe('/');
        expect(variantInSection.toPathInSpace('')).toBe('/section/variant');
    });
});

describe('toPathInSite', () => {
    it('should return the correct path', () => {
        expect(root.toPathInSite('some/path')).toBe('/some/path');
        expect(siteGitBookIO.toPathInSite('some/path')).toBe('/sitename/some/path');
    });

    it('should remove the trailing slash', () => {
        expect(root.toPathInSite('some/path/')).toBe('/some/path');
        expect(siteGitBookIO.toPathInSite('some/path/')).toBe('/sitename/some/path');
    });

    it('should not add an unnecessary trailing slash', () => {
        // The index page should not be an empty path
        expect(root.toPathInSite('')).toBe('/');
        expect(siteGitBookIO.toPathInSite('')).toBe('/sitename');
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

    it('should preserve the search and hash', () => {
        expect(root.toLinkForContent('https://docs.company.com/some/path?a=b#c')).toBe(
            '/some/path?a=b#c'
        );
    });

    it('should preserve an absolute URL if the site is not the same', () => {
        expect(siteGitBookIO.toLinkForContent('https://org.gitbook.io/anothersite/some/path')).toBe(
            'https://org.gitbook.io/anothersite/some/path'
        );
    });
});

describe('linkerWithAbsoluteURLs', () => {
    it('should return a new linker that always returns absolute URLs', () => {
        const absoluteLinker = linkerWithAbsoluteURLs(root);
        expect(absoluteLinker.toPathInSpace('some/path')).toBe(
            'https://docs.company.com/some/path'
        );
        expect(absoluteLinker.toPathInSite('some/path')).toBe('https://docs.company.com/some/path');
    });
});

describe('linkerWithOtherSpaceBasePath', () => {
    it('should return a new linker that resolves links relative to a new spaceBasePath in the current site', () => {
        const otherSpaceBasePathLinker = linkerWithOtherSpaceBasePath(root, {
            spaceBasePath: '/section/variant',
        });
        expect(otherSpaceBasePathLinker.toPathInSpace('some/path')).toBe(
            '/section/variant/some/path'
        );
    });

    it('should return a new linker that resolves links relative to a new spaceBasePath in the current site', () => {
        const otherSpaceBasePathLinker = linkerWithOtherSpaceBasePath(root, {
            spaceBasePath: '/section/variant',
        });
        expect(otherSpaceBasePathLinker.toPathInSpace('some/path')).toBe(
            '/section/variant/some/path'
        );
    });

    it('should use a basepath relative to the site', () => {
        const otherSpaceBasePathLinker = linkerWithOtherSpaceBasePath(siteGitBookIO, {
            spaceBasePath: 'a/b',
        });
        expect(otherSpaceBasePathLinker.toPathInSpace('some/path')).toBe('/sitename/a/b/some/path');
    });

    it('should use a basepath relative to the site (with trailing slash)', () => {
        const otherSpaceBasePathLinker = linkerWithOtherSpaceBasePath(siteGitBookIO, {
            spaceBasePath: '/a/b',
        });
        expect(otherSpaceBasePathLinker.toPathInSpace('some/path')).toBe('/sitename/a/b/some/path');
    });
});

describe('linkerForPublishedURL', () => {
    describe('Root custom domain', () => {
        it('should rewrite links that belongs to the published site to be part of the preview site', () => {
            const previewLinker = linkerForPublishedURL(preview, 'https://docs.company.com/');
            expect(previewLinker.toLinkForContent('https://docs.company.com/some/path')).toBe(
                '/site_abc/some/path'
            );
            expect(
                previewLinker.toLinkForContent('https://docs.company.com/section/variant/some/path')
            ).toBe('/site_abc/section/variant/some/path');
            expect(previewLinker.toLinkForContent('https://www.google.com')).toBe(
                'https://www.google.com'
            );
        });
    });

    describe('gitbook.io domain', () => {
        it('should rewrite links that belongs to the published site to be part of the preview site', () => {
            const previewLinker = linkerForPublishedURL(
                preview,
                'https://org.gitbook.io/sitename/'
            );
            expect(
                previewLinker.toLinkForContent('https://org.gitbook.io/sitename/some/path')
            ).toBe('/site_abc/some/path');
            expect(
                previewLinker.toLinkForContent(
                    'https://org.gitbook.io/sitename/section/variant/some/path'
                )
            ).toBe('/site_abc/section/variant/some/path');
            expect(previewLinker.toLinkForContent('https://www.google.com')).toBe(
                'https://www.google.com'
            );
        });
    });

    it('should should preserve hash and search', () => {
        const previewLinker = linkerForPublishedURL(preview, 'https://docs.company.com/');
        expect(previewLinker.toLinkForContent('https://docs.company.com/some/path?a=b#c')).toBe(
            '/site_abc/some/path?a=b#c'
        );
    });
});
