import { describe, expect, it } from 'bun:test';

import {
    DISALLOW_ALL_ROBOTS_TXT_LINES,
    createRobotsTxtResponse,
    isRobotsTxtRequest,
} from './robots';

describe('isRobotsTxtRequest', () => {
    it('matches robots.txt at the root of the host', () => {
        expect(isRobotsTxtRequest(new URL('https://docs.example.com/robots.txt'))).toBe(true);
    });

    it('matches robots.txt under a site base path', () => {
        expect(isRobotsTxtRequest(new URL('https://example.com/docs/v2/robots.txt'))).toBe(true);
    });

    it('ignores other paths', () => {
        expect(isRobotsTxtRequest(new URL('https://docs.example.com/'))).toBe(false);
        expect(isRobotsTxtRequest(new URL('https://docs.example.com/sitemap.xml'))).toBe(false);
        expect(isRobotsTxtRequest(new URL('https://docs.example.com/my-robots.txt'))).toBe(false);
        expect(isRobotsTxtRequest(new URL('https://docs.example.com/robots.txt/page'))).toBe(false);
    });
});

describe('createRobotsTxtResponse', () => {
    it('serves a disallow-all robots.txt as plain text', async () => {
        const response = createRobotsTxtResponse(DISALLOW_ALL_ROBOTS_TXT_LINES);

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toBe('text/plain');
        expect(await response.text()).toBe(
            'User-agent: *\nContent-Signal: ai-train=no, search=no, ai-input=no\nDisallow: /\n'
        );
    });
});
