export interface GitPageURLSpace {
    id: string;
    gitSync?: {
        url?: string;
        installationProjectDirectory?: string;
    };
}

export interface GitPageURLTarget {
    space: string;
    path: string;
    anchor?: string;
}

/** Locate a unique owning space without fetching any revisions. */
export function findGitPageURLTarget(
    href: string,
    spaces: readonly GitPageURLSpace[]
): GitPageURLTarget | null {
    const url = parseURL(href);
    if (!url || url.search) {
        return null;
    }

    const matches = new Map<string, GitPageURLTarget & { root: string; tree: string }>();
    for (const space of spaces) {
        const { url: treeURL, installationProjectDirectory } = space.gitSync ?? {};
        if (!treeURL || installationProjectDirectory === undefined) {
            continue;
        }
        const tree = parseURL(treeURL);
        if (!tree || tree.host !== url.host) {
            continue;
        }
        const prefix = tree.pathname.replace(/\/$/, '');
        const blobPrefix = prefix
            .replace('/-/tree/', '/-/blob/')
            .replace(/^(\/[^/]+\/[^/]+)\/tree\//, '$1/blob/');
        const matchedPrefix = [prefix, blobPrefix].find((candidate) =>
            url.pathname.startsWith(`${candidate}/`)
        );
        if (!matchedPrefix) {
            continue;
        }

        let filePath: string;
        try {
            const encoded = url.pathname.slice(matchedPrefix.length + 1);
            // Encoded separators make repository/ref boundaries ambiguous.
            if (/%2f|%5c/i.test(encoded)) {
                continue;
            }
            filePath = decodeURIComponent(encoded);
        } catch {
            continue;
        }
        const root = installationProjectDirectory.replace(/^\.\//, '').replace(/^\/+|\/+$/g, '');
        if (
            filePath.split('/').some((part) => part === '.' || part === '..') ||
            filePath.includes('\\')
        ) {
            continue;
        }
        if (root && filePath !== root && !filePath.startsWith(`${root}/`)) {
            continue;
        }
        matches.set(space.id, {
            space: space.id,
            path: filePath,
            anchor: url.hash.slice(1) || undefined,
            root,
            tree: `${tree.host}${prefix}`,
        });
    }

    const candidates = [...matches.values()];
    if (new Set(candidates.map((candidate) => candidate.tree)).size !== 1) {
        return null;
    }
    const longestRoot = Math.max(...candidates.map((candidate) => candidate.root.length));
    const owners = candidates.filter((candidate) => candidate.root.length === longestRoot);
    if (owners.length !== 1) {
        return null;
    }
    const owner = owners[0]!;
    return { space: owner.space, path: owner.path, anchor: owner.anchor };
}

/** Match an API revision's nested page tree, including directory README links. */
export function findPageByGitPath<T extends { id: string; git?: { path: string }; pages?: T[] }>(
    pages: readonly T[],
    filePath: string
): T | null {
    const paths = [filePath, `${filePath.replace(/\/$/, '')}/README.md`];
    const matches: T[] = [];
    const visit = (children: readonly T[]) => {
        for (const page of children) {
            if (page.git && paths.includes(page.git.path)) {
                matches.push(page);
            }
            visit(page.pages ?? []);
        }
    };
    visit(pages);
    return matches.length === 1 ? matches[0]! : null;
}

function parseURL(href: string): URL | null {
    try {
        const url = new URL(href);
        return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password
            ? url
            : null;
    } catch {
        return null;
    }
}
