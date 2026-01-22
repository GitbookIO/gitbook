import { expect, it } from 'bun:test';
import { getContentTestURL } from './utils';

it('should expose a markdown page with the .md extension', async () => {
    const response = await fetch(
        getContentTestURL('https://gitbook.gitbook.io/test-gitbook-open/text-page.md')
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/markdown');
    expect(await response.text()).toContain('# Text page');
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

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/markdown');
    expect(await response.text()).toContain('# Text page');
});
