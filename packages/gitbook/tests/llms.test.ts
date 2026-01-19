import { describe, expect, it } from 'bun:test';
import { getContentTestURL } from './utils';

describe('llms.txt', () => {
    it('should expose a llms.txt file', async () => {
        const response = await fetch(
            getContentTestURL('https://gitbook.gitbook.io/test-gitbook-open/llms.txt')
        );

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/markdown');
        expect(await response.text()).toContain('# E2E Tests GitBook Open');
    });

    it('should expose a llms.txt file with the accept header', async () => {
        const response = await fetch(
            getContentTestURL('https://gitbook.gitbook.io/test-gitbook-open/llms.txt'),
            {
                headers: {
                    Accept: 'text/markdown',
                },
            }
        );

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/markdown');
        expect(await response.text()).toContain('# E2E Tests GitBook Open');
    });
});

describe('llms-full.txt', () => {
    it('should expose a llms-full.txt file', async () => {
        const response = await fetch(
            getContentTestURL('https://gitbook.gitbook.io/test-gitbook-open/llms-full.txt')
        );

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/markdown');
        expect(await response.text()).toContain('# Welcome');
    });

    it('should expose a llms-full.txt file with the accept header', async () => {
        const response = await fetch(
            getContentTestURL('https://gitbook.gitbook.io/test-gitbook-open/llms-full.txt'),
            {
                headers: {
                    Accept: 'text/markdown',
                },
            }
        );

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/markdown');
        expect(await response.text()).toContain('# Welcome');
    });
});
