import { describe, expect, it } from 'bun:test';
import { proxyToGitBook } from '.';

describe('.match', () => {
    it('should return true if the request is below the base path', () => {
        const site = proxyToGitBook({ site: 'https://org.gitbook.io/example/', basePath: '/docs' });
        expect(site.match('/docs')).toBe(true);
        expect(site.match('/docs/')).toBe(true);
        expect(site.match('/docs/hello')).toBe(true);
        expect(site.match('/docs/hello/world')).toBe(true);

        expect(site.match('/hello/world')).toBe(false);
        expect(site.match('/')).toBe(false);
    });
});

describe('.request', () => {
    it('should compute a proper request for a sub-path', () => {
        const site = proxyToGitBook({ site: 'https://org.gitbook.io/example/', basePath: '/docs' });
        const request = new Request('https://example.com/docs/hello/world');

        const proxiedRequest = site.request(request);
        expect(proxiedRequest.url).toBe('https://hosting.gitbook.io/docs/hello/world');
        expect(proxiedRequest.headers.get('Host')).toBe('hosting.gitbook.io');
        expect(proxiedRequest.headers.get('X-Forwarded-Host')).toBe('example.com');
        expect(proxiedRequest.headers.get('X-GitBook-BasePath')).toBe('/docs');
        expect(proxiedRequest.headers.get('X-GitBook-Site-URL')).toBe(
            'https://org.gitbook.io/example/'
        );
    });

    it('should compute a proper request on the root', () => {
        const site = proxyToGitBook({ site: 'https://org.gitbook.io/example/', basePath: '/docs' });
        const request = new Request('https://example.com/docs');

        const proxiedRequest = site.request(request);
        expect(proxiedRequest.url).toBe('https://hosting.gitbook.io/docs');
        expect(proxiedRequest.headers.get('Host')).toBe('hosting.gitbook.io');
        expect(proxiedRequest.headers.get('X-Forwarded-Host')).toBe('example.com');
        expect(proxiedRequest.headers.get('X-GitBook-BasePath')).toBe('/docs');
        expect(proxiedRequest.headers.get('X-GitBook-Site-URL')).toBe(
            'https://org.gitbook.io/example/'
        );
    });

    it('should normalize the basepath', () => {
        const site = proxyToGitBook({ site: 'https://org.gitbook.io/example/', basePath: 'docs/' });
        const request = new Request('https://example.com/docs/hello/world');

        const proxiedRequest = site.request(request);
        expect(proxiedRequest.url).toBe('https://hosting.gitbook.io/docs/hello/world');
        expect(proxiedRequest.headers.get('Host')).toBe('hosting.gitbook.io');
        expect(proxiedRequest.headers.get('X-Forwarded-Host')).toBe('example.com');
        expect(proxiedRequest.headers.get('X-GitBook-BasePath')).toBe('/docs');
        expect(proxiedRequest.headers.get('X-GitBook-Site-URL')).toBe(
            'https://org.gitbook.io/example/'
        );
    });
});
