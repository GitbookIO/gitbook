import { beforeEach, describe, expect, it } from 'bun:test';

import {
    getTryItApiScope,
    getTryItApiSession,
    getTryItOperationSession,
    resetTryItSession,
    saveTryItOperationSession,
} from './session';

const operation = { method: 'post', path: '/pets' };
const values = {
    parameters: { 'query:limit': '5' },
    enabledParameters: {},
    mediaType: 'application/json',
    bodyText: '{}',
    bodyFields: {},
    extraParameters: [],
};

describe('Try it session', () => {
    beforeEach(() => resetTryItSession());

    it('identifies an API by its server origins, whatever the paths or order', () => {
        expect(
            getTryItApiScope([
                { url: 'https://b.example.com/v2' },
                { url: 'https://A.example.com/v1/' },
            ])
        ).toBe(getTryItApiScope([{ url: 'https://a.example.com' }, { url: 'b.example.com' }]));
    });

    it('resolves templated servers before comparing them', () => {
        const withHost = (host: string) =>
            getTryItApiScope([{ url: '{host}/v1', variables: { host: { default: host } } }]);
        expect(withHost('https://api.gitbook.com')).toBe('api.gitbook.com');
        expect(withHost('https://api.a.com')).not.toBe(withHost('https://api.b.com'));
    });

    it('has no scope when no server resolves to a concrete host', () => {
        expect(getTryItApiScope([{ url: '/relative' }])).toBeNull();
        expect(getTryItApiScope([{ url: 'https://{region}.example.com' }])).toBeNull();
        expect(getTryItApiScope([])).toBeNull();
    });

    it('never shares credentials between two APIs', () => {
        const a = getTryItApiScope([{ url: 'https://a.example.com' }]) ?? '';
        const b = getTryItApiScope([{ url: 'https://b.example.com' }]) ?? '';
        getTryItApiSession(a).auth['bearerAuth:value'] = 'token-for-a';

        expect(getTryItApiSession(a).auth).toEqual({ 'bearerAuth:value': 'token-for-a' });
        expect(getTryItApiSession(b).auth).toEqual({});
    });

    it('keeps operations with the same method and path apart across APIs', () => {
        const a = getTryItApiScope([{ url: 'https://a.example.com' }]) ?? '';
        const b = getTryItApiScope([{ url: 'https://b.example.com' }]) ?? '';
        saveTryItOperationSession(a, operation, values);

        expect(getTryItOperationSession(a, { method: 'POST', path: '/pets' })).toEqual(values);
        expect(getTryItOperationSession(b, operation)).toBeUndefined();
    });
});
