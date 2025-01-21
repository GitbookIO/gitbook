import { it, expect } from 'bun:test';
import { generateHTTPExample } from './code-samples';

it('should parse HTTP responses without failing', () => {
    const testUrls = [
        { method: 'GET', url: '//example.com/path' },
        { method: 'GET', url: '//sub.example.com' },
        { method: 'GET', url: '//example:8080/v1/test' },
        { method: 'GET', url: 'ftp://domain.com' },
        { method: 'GET', url: '//example.com/com.example' },
        { method: 'GET', url: 'https://example.com/path.com/another.com' },
    ];

    expect(testUrls.map(generateHTTPExample)).toBeArray();
});
