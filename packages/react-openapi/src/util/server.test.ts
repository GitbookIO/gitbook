import { describe, expect, it } from 'bun:test';
import type { OpenAPIV3 } from '@gitbook/openapi-parser';
import { getDefaultServerURL, interpolateServerURL } from './server';

describe('#interpolateServerURL', () => {
    it('interpolates the server URL with the default values of the variables', () => {
        const server: OpenAPIV3.ServerObject = {
            url: 'https://{username}.example.com/{basePath}',
            variables: {
                username: { default: 'user' },
                basePath: { default: 'v1' },
            },
        };
        const result = interpolateServerURL(server);
        expect(result).toBe('https://user.example.com/v1');
    });

    it('returns the URL with placeholders if no variables are provided', () => {
        const server: OpenAPIV3.ServerObject = {
            url: 'https://{username}.example.com/{basePath}',
        };
        const result = interpolateServerURL(server);
        expect(result).toBe('https://{username}.example.com/{basePath}');
    });

    it('returns the URL with mixed placeholders and default values', () => {
        const server: OpenAPIV3.ServerObject = {
            url: 'https://{username}.example.com/{basePath}',
            variables: {
                basePath: { default: 'v1' },
            },
        };
        const result = interpolateServerURL(server);
        expect(result).toBe('https://{username}.example.com/v1');
    });
});

describe('#getDefaultServerURL', () => {
    it('returns the default server URL', () => {
        const servers: OpenAPIV3.ServerObject[] = [
            {
                url: 'https://{username}.example.com/{basePath}',
                variables: {
                    username: { default: 'user' },
                    basePath: { default: 'v1' },
                },
            },
        ];
        const result = getDefaultServerURL(servers);
        expect(result).toBe('https://user.example.com/v1');
    });

    it('returns empty string if no servers are provided', () => {
        const servers: OpenAPIV3.ServerObject[] = [];
        const result = getDefaultServerURL(servers);
        expect(result).toBe('');
    });
});
