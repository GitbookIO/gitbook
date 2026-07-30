import { describe, expect, it } from 'bun:test';

import { getPPRRequest, getPPRRouteType } from './ppr';

const pprHeaders = new Headers({
    'x-gbo-lookup-url': 'https://docs.example.com/guide',
    'x-gbo-struct-token': 'structure-token',
    'x-gbo-toc-token': 'toc-token',
    'x-gbo-page-token': 'page-token',
    'x-gbo-revision-id': 'revision-id',
    'x-gbo-revalidation-id': 'revalidation-id',
});

describe('getPPRRouteType', () => {
    it('routes static document pages through PPR when all PPR headers are present', () => {
        expect(getPPRRouteType('static', true, getPPRRequest(pprHeaders))).toBe('ppr');
    });

    it('keeps special static routes on their existing route', () => {
        expect(getPPRRouteType('static', false, getPPRRequest(pprHeaders))).toBe('static');
    });

    it('keeps dynamic pages dynamic even when PPR is requested', () => {
        expect(getPPRRouteType('dynamic', true, getPPRRequest(pprHeaders))).toBe('dynamic');
    });

    it('does not opt in with a partial PPR header set', () => {
        for (const header of [
            'x-gbo-lookup-url',
            'x-gbo-struct-token',
            'x-gbo-toc-token',
            'x-gbo-page-token',
            'x-gbo-revision-id',
            'x-gbo-revalidation-id',
        ]) {
            const headers = new Headers(pprHeaders);
            headers.delete(header);
            expect(getPPRRequest(headers)).toBeUndefined();
            expect(getPPRRouteType('static', true, getPPRRequest(headers))).toBe('static');
        }
    });

    it('does not opt in when a required PPR header is empty', () => {
        for (const header of [
            'x-gbo-lookup-url',
            'x-gbo-struct-token',
            'x-gbo-toc-token',
            'x-gbo-page-token',
            'x-gbo-revision-id',
            'x-gbo-revalidation-id',
        ]) {
            const headers = new Headers(pprHeaders);
            headers.set(header, '');
            expect(getPPRRequest(headers)).toBeUndefined();
            expect(getPPRRouteType('static', true, getPPRRequest(headers))).toBe('static');
        }
    });

    it('reads the complete PPR request data', () => {
        expect(getPPRRequest(pprHeaders)).toEqual({
            lookupURL: 'https://docs.example.com/guide',
            structureToken: 'structure-token',
            tocToken: 'toc-token',
            pageToken: 'page-token',
            revisionId: 'revision-id',
            revalidationId: 'revalidation-id',
        });
    });
});
