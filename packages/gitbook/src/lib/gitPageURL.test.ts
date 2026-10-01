import { describe, expect, it } from 'bun:test';

import {
    findGitPageURLTarget,
    findPageByGitPath,
    findPageForGitPageURLTarget,
    matchesGitPageURLTargetPath,
} from './gitPageURL';

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
    it.each(['header%201', '%E6%97%A5%E6%9C%AC', 'part%2Fone', 'percent%2520'])(
        'decodes anchor %s once',
        (anchor) => {
            expect(
                findGitPageURLTarget(
                    `https://github.com/acme/docs/tree/main/api/auth.md#${anchor}`,
                    SPACES
                )?.anchor
            ).toBe(decodeURIComponent(anchor));
        }
    );

    it.each(['%ZZ', '%E0%A4'])('keeps malformed anchor %s unresolved', (anchor) => {
        expect(
            findGitPageURLTarget(
                `https://github.com/acme/docs/tree/main/api/auth.md#${anchor}`,
                SPACES
            )
        ).toBeNull();
    });

    it('accepts the www host alias without accepting unrelated hosts', () => {
        expect(
            findGitPageURLTarget('https://www.github.com/acme/docs/tree/main/api/auth.md', SPACES)
                ?.space
        ).toBe('b');
        expect(
            findGitPageURLTarget(
                'https://www.github.com.evil.test/acme/docs/tree/main/api/auth.md',
                SPACES
            )
        ).toBeNull();
    });

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

    it('treats an omitted live project directory as the repository root', () => {
        expect(
            findGitPageURLTarget('https://github.com/acme/docs/tree/main/api/auth.md', [
                { id: 'old', gitSync: { url: SPACES[0]!.gitSync.url } },
            ])
        ).toEqual({ space: 'old', path: 'api/auth.md', anchor: undefined });
    });

    it.each(['live', 'disconnected'])('keeps similar space directories distinct (%s)', (state) => {
        const spaces = ['docs/space-a', 'docs/space-b', 'api-reference'].map((directory) => ({
            id: directory,
            ...(state === 'live'
                ? {
                      gitSync: {
                          url: SPACES[0]!.gitSync.url,
                          installationProjectDirectory: `/${directory}`,
                      },
                  }
                : { previousGitSync: { url: `${SPACES[0]!.gitSync.url}/${directory}` } }),
        }));
        const url = new URL(
            '../docs/space-b/page.md#details',
            `${SPACES[0]!.gitSync.url}/api-reference/README.md`
        ).href;
        const target = findGitPageURLTarget(url, spaces);
        expect(target?.space).toBe('docs/space-b');
        expect(target?.anchor).toBe('details');
        expect(target && matchesGitPageURLTargetPath(target, 'docs/space-b/page.md')).toBe(true);
        expect(
            findGitPageURLTarget(
                url,
                spaces.filter((space) => space.id !== 'docs/space-b')
            )
        ).toBeNull();
    });

    it.each([
        [
            'https://github.com/old/repo/tree/main/docs/space-b',
            'https://github.com/old/repo/blob/main/docs/space-b/hello%20world.md#details',
        ],
        [
            'https://git.example.com/group/repo/-/tree/release/v2/docs/space-b',
            'https://git.example.com/group/repo/-/blob/release/v2/docs/space-b/hello%20world.md#details',
        ],
    ])('matches the remembered project URL %s', (previousURL, href) => {
        const target = findGitPageURLTarget(href, [
            { id: 'b', previousGitSync: { url: previousURL } },
        ]);
        expect(target?.space).toBe('b');
        expect(target?.anchor).toBe('details');
        expect(target && matchesGitPageURLTargetPath(target, 'docs/space-b/hello world.md')).toBe(
            true
        );
        expect(target && matchesGitPageURLTargetPath(target, 'docs/space-a/hello world.md')).toBe(
            false
        );
    });

    it.each([
        'https://github.com/someone-else/example/blob/main/docs/space-b/page.md',
        'https://github.com/old/repo/tree/other/docs/space-b/page.md',
        'https://github.com.evil.test/old/repo/tree/main/docs/space-b/page.md',
        'https://github.com/old/repo/tree/main/docs/space-b-other/page.md',
        'https://github.com/old/repo/tree/main/other-docs/space-b/page.md',
        'https://github.com/old/repo/tree/main/docs/space-b/%2Fsecret.md',
        'https://github.com/old/repo/tree/main/docs/space-b/%ZZ.md',
    ])('does not reinterpret an unrelated or invalid URL: %s', (href) => {
        expect(
            findGitPageURLTarget(href, [
                {
                    id: 'b',
                    previousGitSync: { url: 'https://github.com/old/repo/tree/main/docs/space-b' },
                },
            ])
        ).toBeNull();
    });

    it('requires a valid previous URL', () => {
        for (const url of [undefined, 'invalid', 'https://github.com/old/repo']) {
            expect(
                findGitPageURLTarget('https://github.com/old/repo/tree/main/docs/space-b/page.md', [
                    { id: 'b', previousGitSync: { url } },
                ])
            ).toBeNull();
        }
    });

    it('supports disconnected repository roots and directory README links', () => {
        const target = findGitPageURLTarget(
            'https://github.com/old/repo/tree/release/v2/docs/space-b/',
            [{ id: 'b', previousGitSync: { url: 'https://github.com/old/repo/tree/release/v2' } }]
        );
        expect(target && matchesGitPageURLTargetPath(target, 'docs/space-b/README.md')).toBe(true);
    });

    it('rejects duplicate previous owners and ignores stale metadata on live installations', () => {
        const previous = {
            previousGitSync: { url: 'https://github.com/old/repo/tree/main/docs/space-b' },
        };
        const url = 'https://github.com/old/repo/tree/main/docs/space-b/page.md';
        expect(
            findGitPageURLTarget(url, [
                { id: 'b', ...previous },
                { id: 'copy', ...previous },
            ])
        ).toBeNull();
        expect(findGitPageURLTarget(url, [{ ...SPACES[1]!, ...previous }])).toBeNull();
    });

    it('compares live and previous project URLs at the same directory boundary', () => {
        const href = 'https://github.com/acme/docs/tree/main/api/auth.md';
        const disconnected = {
            id: 'old-api',
            previousGitSync: { url: 'https://github.com/acme/docs/tree/main/api' },
        };
        expect(findGitPageURLTarget(href, [SPACES[1]!, disconnected])).toBeNull();
        expect(
            findGitPageURLTarget(href, [
                disconnected,
                { id: 'root', gitSync: { url: SPACES[0]!.gitSync.url } },
            ])?.space
        ).toBe('old-api');
    });

    it('accepts the www alias for a remembered project URL', () => {
        expect(
            findGitPageURLTarget('https://www.github.com/acme/docs/blob/main/api/auth.md', [
                { id: 'b', previousGitSync: { url: 'https://github.com/acme/docs/tree/main/api' } },
            ])?.space
        ).toBe('b');
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

describe('findPageForGitPageURLTarget', () => {
    const pages = [
        { id: 'auth', git: { path: 'api/auth.md' }, pages: [] },
        { id: 'group', pages: [{ id: 'readme', git: { path: 'api/11.8/README.md' }, pages: [] }] },
    ];
    it('finds the page of a live target, including directory README links', () => {
        expect(findPageForGitPageURLTarget(pages, { space: 'b', path: 'api/auth.md' })?.id).toBe(
            'auth'
        );
        expect(findPageForGitPageURLTarget(pages, { space: 'b', path: 'api/11.8/' })?.id).toBe(
            'readme'
        );
    });
    it('finds the page of a remembered target whose path still includes the ref', () => {
        expect(
            findPageForGitPageURLTarget(pages, {
                space: 'b',
                path: 'release/v2/api/auth.md',
                pathIncludesRef: true,
            })?.id
        ).toBe('auth');
    });
    it('does not select between duplicate paths', () => {
        expect(
            findPageForGitPageURLTarget(
                [...pages, { id: 'copy', git: { path: 'api/auth.md' }, pages: [] }],
                { space: 'b', path: 'api/auth.md' }
            )
        ).toBeNull();
    });
});
