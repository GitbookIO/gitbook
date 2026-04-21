import { describe, expect, it } from 'bun:test';
import { getContentTestURL } from './utils';

const ASK_QUESTION = 'How are docs optimized for agents?';
const ASK_QUESTION_HEADING = `# ${ASK_QUESTION}`;

describe('markdown pages', () => {
    it('should expose a markdown page with the .md extension', async () => {
        const response = await fetch(
            getContentTestURL('https://gitbook.gitbook.io/test-gitbook-open/text-page.md')
        );
        const text = await response.text();

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/markdown');
        expect(response.headers.get('x-robots-tag')).toBe('noindex');
        expect(text).toContain('# Text page');
        expect(text).toContain('## Ask a question');
    });

    it('should expose a markdown page with the accept header', async () => {
        const response = await fetch(
            getContentTestURL('https://gitbook.gitbook.io/test-gitbook-open/text-page'),
            {
                headers: {
                    Accept: 'text/markdown',
                },
            }
        );
        const text = await response.text();

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/markdown');
        expect(response.headers.get('x-robots-tag')).toBe('noindex');
        expect(text).toContain('# Text page');
        expect(text).toContain('## Ask a question');
    });

    it('should return a 200 for a page not found', async () => {
        const response = await fetch(
            getContentTestURL('https://gitbook.gitbook.io/test-gitbook-open/missing-page.md')
        );
        const text = await response.text();

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/markdown');
        expect(response.headers.get('x-robots-tag')).toBe('noindex');
        expect(text).toContain('# Page Not Found');
        expect(text).toContain('## Ask a question');
    });
});

describe('markdown ask responses', () => {
    it('should expose ask responses for .md requests', async () => {
        const response = await fetch(
            getContentTestURL(
                `https://gitbook.com/docs/getting-started/ai-documentation.md?ask=${encodeURIComponent(ASK_QUESTION)}`
            )
        );
        const text = await response.text();

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/markdown');
        expect(response.headers.get('x-robots-tag')).toBe('noindex');
        expect(text).toContain(ASK_QUESTION_HEADING);
        expect(text).toContain('## Sources');
    });

    it('should expose ask responses for accept header markdown requests', async () => {
        const response = await fetch(
            getContentTestURL(
                `https://gitbook.com/docs/getting-started/ai-documentation?ask=${encodeURIComponent(ASK_QUESTION)}`
            ),
            {
                headers: {
                    Accept: 'text/markdown',
                },
            }
        );
        const text = await response.text();

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/markdown');
        expect(response.headers.get('x-robots-tag')).toBe('noindex');
        expect(text).toContain(ASK_QUESTION_HEADING);
        expect(text).toContain('## Sources');
    });
});
