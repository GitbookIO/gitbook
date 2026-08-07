import { readFile } from 'node:fs/promises';
import {
    type CompatibilityDiagnostic,
    type IssueCommentClient,
    formatCompatibilityComment,
    getCompatibilityDiagnostics,
    upsertCompatibilityComment,
} from '../src/lib/cssBrowserCompatibility';

interface PullRequestEvent {
    pull_request: {
        base: { sha: string };
        head: { sha: string };
        number: number;
    };
}

interface PullRequestFile {
    filename: string;
    previous_filename?: string;
    status: 'added' | 'copied' | 'modified' | 'removed' | 'renamed' | 'unchanged';
}

interface ContentResponse {
    content: string;
    encoding: string;
    sha: string;
}

interface GitBlobResponse {
    content: string;
    encoding: string;
}

interface IssueComment {
    body: string;
    id: number;
    user: { login: string } | null;
}

class GitHubRequestError extends Error {
    constructor(
        readonly status: number,
        message: string
    ) {
        super(message);
    }
}

class GitHubApi implements IssueCommentClient {
    constructor(
        private readonly repository: string,
        private readonly token: string
    ) {}

    private async request<T>(path: string, init?: RequestInit): Promise<T> {
        const response = await fetch(`https://api.github.com${path}`, {
            ...init,
            headers: {
                Accept: 'application/vnd.github+json',
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json',
                'X-GitHub-Api-Version': '2022-11-28',
                ...init?.headers,
            },
        });
        const responseText = await response.text();

        if (!response.ok) {
            throw new GitHubRequestError(
                response.status,
                `${init?.method ?? 'GET'} ${path} failed: ${responseText}`
            );
        }

        return JSON.parse(responseText) as T;
    }

    async listPullRequestFiles(pullRequestNumber: number): Promise<PullRequestFile[]> {
        const files: PullRequestFile[] = [];

        for (let page = 1; ; page += 1) {
            const result = await this.request<PullRequestFile[]>(
                `/repos/${this.repository}/pulls/${pullRequestNumber}/files?per_page=100&page=${page}`
            );
            files.push(...result);
            if (result.length < 100) {
                return files;
            }
        }
    }

    private async getContent(path: string, ref: string): Promise<string> {
        const encodedPath = path.split('/').map(encodeURIComponent).join('/');
        const content = await this.request<ContentResponse>(
            `/repos/${this.repository}/contents/${encodedPath}?ref=${encodeURIComponent(ref)}`
        );
        const response = content.content
            ? content
            : await this.request<GitBlobResponse>(
                  `/repos/${this.repository}/git/blobs/${content.sha}`
              );

        if (response.encoding !== 'base64') {
            throw new Error(
                `Unsupported GitHub content encoding for ${path}: ${response.encoding}`
            );
        }

        return Buffer.from(response.content.replaceAll('\n', ''), 'base64').toString('utf8');
    }

    async getFileAtRef(path: string, ref: string): Promise<string> {
        return this.getContent(path, ref);
    }

    async listIssueComments(issueNumber: number): Promise<IssueComment[]> {
        const comments: IssueComment[] = [];

        for (let page = 1; ; page += 1) {
            const result = await this.request<IssueComment[]>(
                `/repos/${this.repository}/issues/${issueNumber}/comments?per_page=100&page=${page}`
            );
            comments.push(...result);
            if (result.length < 100) {
                return comments;
            }
        }
    }

    async createIssueComment(issueNumber: number, body: string): Promise<void> {
        await this.request(`/repos/${this.repository}/issues/${issueNumber}/comments`, {
            body: JSON.stringify({ body }),
            method: 'POST',
        });
    }

    async updateIssueComment(commentId: number, body: string): Promise<void> {
        await this.request(`/repos/${this.repository}/issues/comments/${commentId}`, {
            body: JSON.stringify({ body }),
            method: 'PATCH',
        });
    }
}

async function getBrowserslist(api: GitHubApi, headSha: string): Promise<string[]> {
    const packageJson = JSON.parse(
        await api.getFileAtRef('packages/gitbook/package.json', headSha)
    ) as { browserslist?: string[] };

    if (!packageJson.browserslist?.length) {
        throw new Error('packages/gitbook/package.json must define a Browserslist configuration.');
    }

    return packageJson.browserslist;
}

async function getBaseContent(
    api: GitHubApi,
    file: PullRequestFile,
    baseSha: string
): Promise<string> {
    if (file.status === 'added') {
        return '';
    }

    try {
        return await api.getFileAtRef(file.previous_filename ?? file.filename, baseSha);
    } catch (error) {
        if (error instanceof GitHubRequestError && error.status === 404) {
            return '';
        }
        throw error;
    }
}

async function run(): Promise<boolean> {
    const token = process.env.GITHUB_TOKEN;
    const repository = process.env.GITHUB_REPOSITORY;
    const eventPath = process.env.GITHUB_EVENT_PATH;

    if (!token || !repository || !eventPath) {
        throw new Error('GITHUB_TOKEN, GITHUB_REPOSITORY, and GITHUB_EVENT_PATH are required.');
    }

    const event = JSON.parse(await readFile(eventPath, 'utf8')) as PullRequestEvent;
    const pullRequest = event.pull_request;
    if (!pullRequest) {
        throw new Error('This script must run from a pull request event.');
    }

    const api = new GitHubApi(repository, token);
    const browsers = await getBrowserslist(api, pullRequest.head.sha);
    const files = (await api.listPullRequestFiles(pullRequest.number)).filter(
        (file) => file.status !== 'removed' && file.filename.endsWith('.css')
    );
    const diagnostics: CompatibilityDiagnostic[] = [];

    for (const file of files) {
        const [base, head] = await Promise.all([
            getBaseContent(api, file, pullRequest.base.sha),
            api.getFileAtRef(file.filename, pullRequest.head.sha),
        ]);
        diagnostics.push(
            ...(await getCompatibilityDiagnostics({
                base,
                browsers,
                file: file.filename,
                head,
            }))
        );
    }

    const comment = formatCompatibilityComment({
        diagnostics,
        headSha: pullRequest.head.sha,
        repository,
    });
    await upsertCompatibilityComment({
        body: comment,
        createIfMissing:
            diagnostics.length > 0 ||
            process.env.CSS_BROWSER_COMPATIBILITY_ALWAYS_COMMENT === 'true',
        client: api,
        issueNumber: pullRequest.number,
    });

    if (diagnostics.length === 0) {
        console.log('CSS browser compatibility check passed.');
        return true;
    }

    console.error('Unsupported CSS declarations found:');
    for (const diagnostic of diagnostics) {
        console.error(
            `${diagnostic.file}:${diagnostic.line} ${diagnostic.property} — ${diagnostic.unsupportedBrowsers}`
        );
    }
    return false;
}

try {
    process.exitCode = (await run()) ? 0 : 1;
} catch (error) {
    console.error(error);
    process.exitCode = 1;
}
