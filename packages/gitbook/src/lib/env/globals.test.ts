import { describe, expect, it } from 'bun:test';

import { removeAPIGatewayPath } from './globals';

describe('removeAPIGatewayPath', () => {
    it('removes the final cache/ segment', () => {
        expect(removeAPIGatewayPath('https://api.gitbook.com/cache/')).toBe(
            'https://api.gitbook.com/'
        );
        expect(removeAPIGatewayPath('https://example.com/prefix/cache')).toBe(
            'https://example.com/prefix/'
        );
    });

    it('keeps a URL without a final cache/ segment', () => {
        expect(removeAPIGatewayPath('https://api.gitbook.com')).toBe('https://api.gitbook.com');
        expect(removeAPIGatewayPath('https://example.com/cache/v1/')).toBe(
            'https://example.com/cache/v1/'
        );
        expect(removeAPIGatewayPath('https://example.com/mycache/')).toBe(
            'https://example.com/mycache/'
        );
    });

    it('keeps an empty or unparseable URL', () => {
        expect(removeAPIGatewayPath('')).toBe('');
        expect(removeAPIGatewayPath('api.gitbook.com/cache/')).toBe('api.gitbook.com/cache/');
    });
});
