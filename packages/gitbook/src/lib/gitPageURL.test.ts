import { describe, expect, it } from 'bun:test';

import { findGitPageURLTarget, findPageByGitPath } from './gitPageURL';

const SPACES = [
    {
        id: 'a',
        gitSync: {
            url: 'https://github.com/acme/docs/tree/main',
            installationProjectDirectory: 'guides',
        },
    },
    {
        id: 'b',
        gitSync: {
            url: 'https://github.com/acme/docs/tree/main',
            installationProjectDirectory: '/api/',
        },
    },
];

describe('findGitPageURLTarget', () => {
    it('matches the repository, ref and directory and preserves anchors', () => {
        expect(
            findGitPageURLTarget(
                'https://github.com/acme/docs/tree/main/api/auth.md#tokens',
                SPACES
            )
        ).toEqual({ space: 'b', path: 'api/auth.md', anchor: 'tokens' });
    });

    it.each([
        'https://github.com/other/docs/tree/main/api/auth.md',
        'https://github.com/acme/docs/tree/preview/api/auth.md',
        'https://github.com.evil.test/acme/docs/tree/main/api/auth.md',
        'https://github.com/acme/docs/tree/main/api-other/auth.md',
        'https://github.com/acme/docs/tree/main/api/auth.md?raw=1',
        'https://github.com/acme/docs/tree/main/api/%ZZ.md',
        'https://github.com/acme/docs/tree/main/api/%2Fsecret.md',
    ])('does not reinterpret %s', (url) => {
        expect(findGitPageURLTarget(url, SPACES)).toBeNull();
    });

    it('supports blob URLs and encoded file names', () => {
        expect(
            findGitPageURLTarget(
                'https://github.com/acme/docs/blob/main/api/hello%20world.md',
                SPACES
            )
        ).toEqual({ space: 'b', path: 'api/hello world.md', anchor: undefined });
    });

    it('matches self-hosted GitLab with nested groups and a slash in the branch', () => {
        const spaces = [
            {
                id: 'b',
                gitSync: {
                    url: 'https://git.example.com/group/sub/docs/-/tree/release/v2',
                    installationProjectDirectory: 'api',
                },
            },
        ];
        expect(
            findGitPageURLTarget(
                'https://git.example.com/group/sub/docs/-/blob/release/v2/api/auth.md',
                spaces
            )?.space
        ).toBe('b');
    });

    it('rejects ambiguous owners and ambiguous branch prefixes', () => {
        expect(
            findGitPageURLTarget('https://github.com/acme/docs/tree/main/api/auth.md', [
                ...SPACES,
                { ...SPACES[1]!, id: 'duplicate' },
            ])
        ).toBeNull();
        expect(
            findGitPageURLTarget('https://github.com/acme/docs/tree/main/api/auth.md', [
                ...SPACES,
                {
                    id: 'other-ref',
                    gitSync: {
                        url: 'https://github.com/acme/docs/tree/main/api',
                        installationProjectDirectory: '',
                    },
                },
            ])
        ).toBeNull();
    });

    it('prefers the most specific directory and deduplicates site placements', () => {
        expect(
            findGitPageURLTarget('https://github.com/acme/docs/tree/main/api/auth.md', [
                ...SPACES,
                SPACES[1]!,
                {
                    id: 'root',
                    gitSync: { url: SPACES[0]!.gitSync.url, installationProjectDirectory: '' },
                },
            ])?.space
        ).toBe('b');
    });

    it('requires directory metadata, including an explicit empty root directory', () => {
        expect(
            findGitPageURLTarget('https://github.com/acme/docs/tree/main/api/auth.md', [
                { id: 'old', gitSync: { url: SPACES[0]!.gitSync.url } },
            ])
        ).toBeNull();
    });
});

describe('findPageByGitPath', () => {
    const pages = [
        { id: 'auth', git: { path: 'api/auth.md' }, pages: [] },
        { id: 'group', pages: [{ id: 'readme', git: { path: 'api/11.8/README.md' }, pages: [] }] },
    ];
    it('finds nested pages and directory README links', () => {
        expect(findPageByGitPath(pages, 'api/auth.md')?.id).toBe('auth');
        expect(findPageByGitPath(pages, 'api/11.8/')?.id).toBe('readme');
        expect(findPageByGitPath(pages, 'api/missing.md')).toBeNull();
    });
    it('does not select between duplicate paths', () => {
        expect(
            findPageByGitPath(
                [...pages, { id: 'copy', git: { path: 'api/auth.md' }, pages: [] }],
                'api/auth.md'
            )
        ).toBeNull();
    });
});
