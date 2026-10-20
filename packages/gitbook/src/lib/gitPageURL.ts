export interface GitPageURLSpace {
    id: string;
    gitSync?: {
        url?: string;
        installationProjectDirectory?: string;
    };
    previousGitSync?: { url?: string };
}

export interface GitPageURLTarget {
    space: string;
    path: string;
    anchor?: string;
    /** Previous project URLs do not distinguish a slash-containing ref from the file path. */
    pathIncludesRef?: boolean;
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
    let anchor: string | undefined;
    try {
        anchor = decodeURIComponent(url.hash.slice(1)) || undefined;
    } catch {
        return null;
    }

    const matches = new Map<string, GitPageURLTarget & { root: string; tree?: string }>();
    for (const space of spaces) {
        const directory = space.gitSync?.installationProjectDirectory ?? '';
        let root = directory.replace(/^\.\//, '').replace(/^\/+|\/+$/g, '');
        let filePath: string | null;
        let treeKey: string | undefined;
        if (space.gitSync) {
            const tree = space.gitSync.url ? parseURL(space.gitSync.url) : null;
            if (!tree || (tree.host !== url.host && url.host !== `www.${tree.host}`)) {
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
            filePath = decodeGitPath(url.pathname.slice(matchedPrefix.length + 1));
            treeKey = `${tree.host}${prefix}`;
            if (!filePath || (root && filePath !== root && !filePath.startsWith(`${root}/`))) {
                continue;
            }
            root = `${prefix}/${root}`.replace(/\/$/, '');
        } else {
            const previous = space.previousGitSync?.url
                ? parseURL(space.previousGitSync.url)
                : null;
            filePath = previous ? findPreviousGitPath(url, previous) : null;
            if (!filePath || !previous) {
                continue;
            }
            root = previous.pathname.replace(/\/$/, '');
        }
        matches.set(space.id, {
            space: space.id,
            path: filePath,
            anchor,
            root,
            tree: treeKey,
            ...(!space.gitSync ? { pathIncludesRef: true } : {}),
        });
    }

    const candidates = [...matches.values()];
    if (
        new Set(candidates.flatMap((candidate) => (candidate.tree ? [candidate.tree] : []))).size >
        1
    ) {
        return null;
    }
    const longestRoot = Math.max(...candidates.map((candidate) => candidate.root.length));
    const owners = candidates.filter((candidate) => candidate.root.length === longestRoot);
    if (owners.length !== 1) {
        return null;
    }
    const owner = owners[0]!;
    return {
        space: owner.space,
        path: owner.path,
        anchor: owner.anchor,
        ...(owner.pathIncludesRef ? { pathIncludesRef: true } : {}),
    };
}

/** Match stored page paths after verifying the owning repository URL; callers must reject multiple pages. */
export function matchesGitPageURLTargetPath(target: GitPageURLTarget, filePath: string): boolean {
    const paths = [target.path, `${target.path.replace(/\/$/, '')}/README.md`];
    return paths.some((path) =>
        target.pathIncludesRef ? path.endsWith(`/${filePath}`) : path === filePath
    );
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

/** Find the only page of an API revision's page tree at the path a target points to. */
export function findPageForGitPageURLTarget<
    T extends { id: string; git?: { path: string }; pages?: T[] },
>(pages: readonly T[], target: GitPageURLTarget): T | null {
    const matches: T[] = [];
    const visit = (children: readonly T[]) => {
        for (const page of children) {
            if (page.git && matchesGitPageURLTargetPath(target, page.git.path)) {
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

function decodeGitPath(encoded: string): string | null {
    try {
        // Encoded separators make repository/ref boundaries ambiguous.
        if (/%2f|%5c/i.test(encoded)) {
            return null;
        }
        const decoded = decodeURIComponent(encoded);
        return decoded.includes('\\') ||
            decoded.split('/').some((part) => part === '.' || part === '..')
            ? null
            : decoded;
    } catch {
        return null;
    }
}

function findPreviousGitPath(url: URL, previous: URL): string | null {
    if (
        previous.search ||
        previous.hash ||
        !/\/(?:tree|blob)\/.+/.test(previous.pathname) ||
        (url.host !== previous.host && url.host !== `www.${previous.host}`)
    ) {
        return null;
    }
    const prefix = previous.pathname.replace(/\/$/, '');
    const blobPrefix = prefix
        .replace('/-/tree/', '/-/blob/')
        .replace(/^(\/[^/]+\/[^/]+)\/tree\//, '$1/blob/');
    if (
        ![prefix, blobPrefix].some(
            (candidate) => url.pathname === candidate || url.pathname.startsWith(`${candidate}/`)
        )
    ) {
        return null;
    }
    // Keep the ref until revision lookup: its slash boundary is not recorded separately.
    const suffix = url.pathname.match(/\/(?:tree|blob)\/(.+)$/)?.[1];
    return suffix ? decodeGitPath(suffix) : null;
}
