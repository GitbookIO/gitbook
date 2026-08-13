import { describe, expect, it } from 'bun:test';
import {
    COMMENT_MARKER,
    type IssueCommentClient,
    formatCompatibilityComment,
    getAddedDeclarations,
    getChangedLines,
    getCompatibilityDiagnostics,
    upsertCompatibilityComment,
} from './cssBrowserCompatibility';

const baseCSS = `.card {
    color: red;
}
`;

describe('getChangedLines', () => {
    it('tracks added and removed line numbers independently', () => {
        const changedLines = getChangedLines('one\ntwo\n', 'one\nthree\n');

        expect(changedLines.added).toEqual(new Set([2]));
        expect(changedLines.removed).toEqual(new Set([2]));
    });
});

describe('getAddedDeclarations', () => {
    it('returns newly added declarations', () => {
        const declarations = getAddedDeclarations(
            baseCSS,
            `.card {
    color: red;
    container-type: inline-size;
}
`
        );

        expect(declarations).toEqual([{ column: 5, line: 3, property: 'container-type' }]);
    });

    it('does not treat a value change as a newly added property', () => {
        const declarations = getAddedDeclarations(
            baseCSS,
            `.card {
    color: blue;
}
`
        );

        expect(declarations).toEqual([]);
    });

    it('uses the declaration start for multiline declarations', () => {
        const declarations = getAddedDeclarations(
            baseCSS,
            `.card {
    color: red;
    background-image: linear-gradient(
        red,
        blue
    );
}
`
        );

        expect(declarations).toEqual([{ column: 5, line: 3, property: 'background-image' }]);
    });
});

describe('getCompatibilityDiagnostics', () => {
    it('ignores compatible and custom properties', async () => {
        const diagnostics = await getCompatibilityDiagnostics({
            base: baseCSS,
            browsers: ['safari 12'],
            file: 'packages/gitbook/src/example.css',
            head: `.card {
    color: red;
    --card-color: red;
    display: flex;
}
`,
        });

        expect(diagnostics).toEqual([]);
    });

    it('reports a newly added unsupported property once', async () => {
        const diagnostics = await getCompatibilityDiagnostics({
            base: baseCSS,
            browsers: ['safari 12'],
            file: 'packages/gitbook/src/example.css',
            head: `.card {
    color: red;
    appearance: none;
}
`,
        });

        expect(diagnostics).toHaveLength(1);
        expect(diagnostics[0]).toMatchObject({
            file: 'packages/gitbook/src/example.css',
            line: 3,
            property: 'appearance',
            unsupportedBrowsers: 'Safari 12',
        });
    });

    it('attributes same-line declarations to the property that uses the feature', async () => {
        const diagnostics = await getCompatibilityDiagnostics({
            base: '.card { color: red; }\n',
            browsers: ['safari 12'],
            file: 'packages/gitbook/src/example.css',
            head: '.card { color: red; appearance: none; }\n',
        });

        expect(diagnostics).toHaveLength(1);
        expect(diagnostics[0]?.property).toBe('appearance');
    });
});

class FakeCommentClient implements IssueCommentClient {
    created: string[] = [];
    comments: Array<{
        body: string;
        id: number;
        user: { login: string } | null;
    }> = [];
    updated: Array<{ body: string; id: number }> = [];

    async createIssueComment(_issueNumber: number, body: string): Promise<void> {
        this.created.push(body);
    }

    async listIssueComments(): Promise<typeof this.comments> {
        return this.comments;
    }

    async updateIssueComment(commentId: number, body: string): Promise<void> {
        this.updated.push({ body, id: commentId });
    }
}

describe('PR comments', () => {
    const diagnostics = [
        {
            column: 5,
            feature: 'css-container-queries',
            file: 'packages/gitbook/src/example.css',
            line: 3,
            property: 'container-type',
            unsupportedBrowsers: 'Safari 12',
        },
    ];

    it('formats an actionable compatibility report', () => {
        const comment = formatCompatibilityComment({
            diagnostics,
            headSha: 'abc123',
            repository: 'GitbookIO/gitbook',
        });

        expect(comment).toContain(COMMENT_MARKER);
        expect(comment).toContain('container-type');
        expect(comment).toContain('Safari 12');
        expect(comment).toContain('example.css:3');
    });

    it('creates a failure comment, updates it on rerun, and marks it clean', async () => {
        const client = new FakeCommentClient();
        const failureComment = formatCompatibilityComment({
            diagnostics,
            headSha: 'abc123',
            repository: 'GitbookIO/gitbook',
        });

        await upsertCompatibilityComment({ body: failureComment, client, issueNumber: 42 });
        expect(client.created).toEqual([failureComment]);

        client.comments = [{ body: failureComment, id: 9, user: { login: 'github-actions[bot]' } }];
        const passingComment = formatCompatibilityComment({
            diagnostics: [],
            headSha: 'def456',
            repository: 'GitbookIO/gitbook',
        });
        await upsertCompatibilityComment({
            body: passingComment,
            createIfMissing: false,
            client,
            issueNumber: 42,
        });

        expect(client.updated).toEqual([{ body: passingComment, id: 9 }]);
    });

    it('does not add a passing comment when no compatibility comment exists', async () => {
        const client = new FakeCommentClient();
        await upsertCompatibilityComment({
            body: formatCompatibilityComment({
                diagnostics: [],
                headSha: 'abc123',
                repository: 'GitbookIO/gitbook',
            }),
            createIfMissing: false,
            client,
            issueNumber: 42,
        });

        expect(client.created).toEqual([]);
        expect(client.updated).toEqual([]);
    });
});
