import { describe, expect, it } from 'bun:test';
import { isSiteAuthLoginHref } from './auth-login-link';
import { createLinker, linkerForPublishedURL } from './links';

type SiteFixture = {
    label: string;
    publishedURL: string;
    siteBasePath: string;
    localhostLoginURL: string;
    previewLoginURL: string;
    publishedLoginURL: string;
};

const previewHost = '41ba7c7e-gitbook-open-v2-preview.gitbook.workers.dev';
const fixtures: SiteFixture[] = [
    {
        label: 'proxy sites',
        publishedURL: 'https://gitbook.com/docs',
        siteBasePath: '/url/gitbook.com/docs',
        localhostLoginURL: 'https://localhost:3000/url/gitbook.com/docs/~gitbook/auth/login',
        previewLoginURL: `https://${previewHost}/url/gitbook.com/docs/~gitbook/auth/login`,
        publishedLoginURL: 'https://gitbook.com/docs/~gitbook/auth/login',
    },
    {
        label: 'GitBook-hosted site with a path prefix',
        publishedURL: 'https://gitbook.gitbook.io/test/',
        siteBasePath: '/url/gitbook.gitbook.io/test',
        localhostLoginURL: 'https://localhost:3000/url/gitbook.gitbook.io/test/~gitbook/auth/login',
        previewLoginURL: `https://${previewHost}/url/gitbook.gitbook.io/test/~gitbook/auth/login`,
        publishedLoginURL: 'https://gitbook.gitbook.io/test/~gitbook/auth/login',
    },
    {
        label: 'custom domain at the root path',
        publishedURL: 'https://docs.acme.org/',
        siteBasePath: '/url/docs.acme.org',
        localhostLoginURL: 'https://localhost:3000/url/docs.acme.org/~gitbook/auth/login',
        previewLoginURL: `https://${previewHost}/url/docs.acme.org/~gitbook/auth/login`,
        publishedLoginURL: 'https://docs.acme.org/~gitbook/auth/login',
    },
];

function createURLModeSiteLinker(currentHost: string, siteBasePath: string, publishedURL: string) {
    const linker = createLinker({
        protocol: 'https:',
        host: currentHost,
        siteBasePath,
        spaceBasePath: `${siteBasePath}/getting-started`,
    });

    return linkerForPublishedURL(linker, publishedURL);
}

describe('isSiteAuthLoginHref', () => {
    describe.each(fixtures)('$label', (fixture) => {
        it('matches the localhost absolute login URL for the current site', () => {
            const linker = createURLModeSiteLinker(
                'localhost:3000',
                fixture.siteBasePath,
                fixture.publishedURL
            );

            expect(isSiteAuthLoginHref(linker, fixture.localhostLoginURL)).toBe(true);
        });

        it('matches the workers preview absolute login URL for the current site', () => {
            const linker = createURLModeSiteLinker(
                previewHost,
                fixture.siteBasePath,
                fixture.publishedURL
            );

            expect(isSiteAuthLoginHref(linker, fixture.previewLoginURL)).toBe(true);
        });

        it('matches the published-site absolute login URL when served through preview', () => {
            const linker = createURLModeSiteLinker(
                previewHost,
                fixture.siteBasePath,
                fixture.publishedURL
            );

            expect(isSiteAuthLoginHref(linker, fixture.publishedLoginURL)).toBe(true);
        });
    });
});
