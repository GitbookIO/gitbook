import { it, expect } from 'bun:test';
import { parseHostAndPath } from './code-samples';

it('should parse host and path on url strings properly', () => {
    const testUrls = [
        '//example.com/path',
        '//sub.example.com',
        '//example:8080/v1/test',
        'ftp://domain.com',
        '//example.com/com.example',
        'https://example.com/path.com/another.com',
        'example.com/firstPath/secondPath',
    ];

    expect(testUrls.map(parseHostAndPath)).toEqual([
        {
            host: 'example.com',
            path: '/path',
        },

        {
            host: 'sub.example.com',
            path: '/',
        },

        {
            host: 'example:8080',
            path: '/v1/test',
        },

        {
            host: 'domain.com',
            path: '/',
        },

        {
            host: 'example.com',
            path: '/com.example',
        },

        {
            host: 'example.com',
            path: '/path.com/another.com',
        },

        {
            host: 'example.com',
            path: '/firstPath/secondPath',
        },
    ]);
});
