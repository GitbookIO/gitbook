import { describe, expect, it } from 'bun:test';
import { getProxyModeBasePath } from './proxy';

describe('getProxyModeBasePath', () => {
    it('should return the base path for proxy mode (base = /, path = /)', () => {
        const input = new URL('https://example.com/docs');
        const resolved = { basePath: '/', pathname: '/' };
        expect(getProxyModeBasePath(input, resolved)).toEqual('/docs/');
    });

    it('should return the base path for proxy mode (base = /, path = /hello/world)', () => {
        const input = new URL('https://example.com/docs/hello/world');
        const resolved = { basePath: '/', pathname: '/hello/world' };
        expect(getProxyModeBasePath(input, resolved)).toEqual('/docs/');
    });

    it('should return the base path for proxy mode (base = /v1, path = /)', () => {
        const input = new URL('https://example.com/docs/v1');
        const resolved = { basePath: '/v1', pathname: '/' };
        expect(getProxyModeBasePath(input, resolved)).toEqual('/docs/v1/');
    });

    it('should return the base path for proxy mode (base = /v1/, path = /)', () => {
        const input = new URL('https://example.com/docs/v1/');
        const resolved = { basePath: '/v1/', pathname: '/' };
        expect(getProxyModeBasePath(input, resolved)).toEqual('/docs/v1/');
    });

    it('should return the base path for proxy mode (base = /v1, path = /hello/world)', () => {
        const input = new URL('https://example.com/docs/v1/hello/world');
        const resolved = { basePath: '/v1', pathname: '/hello/world' };
        expect(getProxyModeBasePath(input, resolved)).toEqual('/docs/v1/');
    });

    it('should return the base path for proxy mode (base = /v1/, path = /hello/world)', () => {
        const input = new URL('https://example.com/docs/v1/hello/world');
        const resolved = { basePath: '/v1/', pathname: '/hello/world' };
        expect(getProxyModeBasePath(input, resolved)).toEqual('/docs/v1/');
    });
});
