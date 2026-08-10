import { describe, expect, it } from 'bun:test';
import { mergeHeaders } from './headers';

describe('mergeHeaders', () => {
    it('should merge headers without conflicts', () => {
        const baseHeaders = {
            'user-agent': 'browser',
            Authorization: 'Bearer token',
        };
        const overrideHeaders = {
            'Content-Type': 'application/json',
        };

        const result = mergeHeaders(baseHeaders, overrideHeaders);

        expect(result['user-agent']).toBe('browser');
        expect(result.Authorization).toBe('Bearer token');
        expect(result['Content-Type']).toBe('application/json');
    });

    it('should remove duplicate headers case-insensitively', () => {
        const baseHeaders = {
            'content-type': 'application/vnd.api+json',
            'user-agent': 'browser',
        };
        const overrideHeaders = {
            'Content-Type': 'application/json',
        };

        const result = mergeHeaders(baseHeaders, overrideHeaders);

        // Should only have one Content-Type header (from override)
        expect(result['Content-Type']).toBe('application/json');
        expect(result['content-type']).toBeUndefined();
        expect(result['user-agent']).toBe('browser');
    });

    it('should handle multiple case variations', () => {
        const baseHeaders = {
            'Content-Type': 'application/json',
            'content-type': 'application/vnd.api+json',
            'CONTENT-TYPE': 'text/plain',
            'User-Agent': 'browser',
        };
        const overrideHeaders = {
            'Content-Type': 'application/xml',
        };

        const result = mergeHeaders(baseHeaders, overrideHeaders);

        // Should only have one Content-Type header (from override)
        expect(result['Content-Type']).toBe('application/xml');
        expect(result['content-type']).toBeUndefined();
        expect(result['CONTENT-TYPE']).toBeUndefined();
        expect(result['User-Agent']).toBe('browser');
    });

    it('should override headers with same key but different casing', () => {
        const baseHeaders = {
            'user-agent': 'old-browser',
            'User-Agent': 'new-browser',
        };
        const overrideHeaders = {
            'USER-AGENT': 'override-browser',
        };

        const result = mergeHeaders(baseHeaders, overrideHeaders);

        // Should only have the override header
        expect(result['USER-AGENT']).toBe('override-browser');
        expect(result['user-agent']).toBeUndefined();
        expect(result['User-Agent']).toBeUndefined();
    });

    it('should handle empty base headers', () => {
        const baseHeaders = {};
        const overrideHeaders = {
            'Content-Type': 'application/json',
            Authorization: 'Bearer token',
        };

        const result = mergeHeaders(baseHeaders, overrideHeaders);

        expect(result['Content-Type']).toBe('application/json');
        expect(result.Authorization).toBe('Bearer token');
    });

    it('should handle empty override headers', () => {
        const baseHeaders = {
            'Content-Type': 'application/json',
            Authorization: 'Bearer token',
        };
        const overrideHeaders = {};

        const result = mergeHeaders(baseHeaders, overrideHeaders);

        expect(result['Content-Type']).toBe('application/json');
        expect(result.Authorization).toBe('Bearer token');
    });

    it('should preserve override header casing', () => {
        const baseHeaders = {
            'content-type': 'application/json',
        };
        const overrideHeaders = {
            'Content-Type': 'application/xml',
        };

        const result = mergeHeaders(baseHeaders, overrideHeaders);

        // Should use the casing from override headers
        expect(result['Content-Type']).toBe('application/xml');
        expect(Object.keys(result)).toContain('Content-Type');
        expect(Object.keys(result)).not.toContain('content-type');
    });
});
