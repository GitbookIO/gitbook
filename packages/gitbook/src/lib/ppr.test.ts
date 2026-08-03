import { describe, expect, it } from 'bun:test';

import { getPPRRequest, getPPRRouteType } from './ppr';

const pprHeaders = new Headers({
    'x-gbo-site': 'site-id',
    'x-gbo-site-section': 'site-section-id',
    'x-gbo-site-space': 'site-space-id',
    'x-gbo-space': 'space-id',
    'x-gbo-site-base-path': '/docs',
    'x-gbo-base-path': '/docs/guide',
    'x-gbo-pathname': '/getting-started',
    'x-gbo-organization': 'organization-id',
    'x-gbo-share-key': 'share-key',
    'x-gbo-complete': 'true',
    'x-gbo-context-id': 'context-id',
    'x-gbo-canonical-url': 'https://docs.example.com/guide',
    'x-gbo-preview': 'false',
    'x-gbo-revision': 'revision-id',
    'x-gbo-change-request': 'change-request-id',
    'x-gbo-api-token': 'api-token',
    'x-gbo-revalidation-id': 'revalidation-id',
    'x-gbo-default-site-section': 'default-site-section-id',
    'x-gbo-default-site-space': 'default-site-space-id',
    'x-gbo-default-space': 'default-space-id',
});

describe('getPPRRouteType', () => {
    it('routes static document pages through PPR when resolved content headers are present', () => {
        expect(getPPRRouteType('static', true, getPPRRequest(pprHeaders))).toBe('ppr');
    });

    it('keeps special static routes on their existing route', () => {
        expect(getPPRRouteType('static', false, getPPRRequest(pprHeaders))).toBe('static');
    });

    it('keeps dynamic pages dynamic even when PPR is requested', () => {
        expect(getPPRRouteType('dynamic', true, getPPRRequest(pprHeaders))).toBe('dynamic');
    });

    it('does not opt in with a partial resolved-content header set', () => {
        for (const header of [
            'x-gbo-site',
            'x-gbo-site-space',
            'x-gbo-space',
            'x-gbo-site-base-path',
            'x-gbo-base-path',
            'x-gbo-pathname',
            'x-gbo-organization',
            'x-gbo-complete',
            'x-gbo-canonical-url',
            'x-gbo-api-token',
            'x-gbo-revision',
            'x-gbo-revalidation-id',
            'x-gbo-default-site-section',
            'x-gbo-default-site-space',
            'x-gbo-default-space',
        ]) {
            const headers = new Headers(pprHeaders);
            headers.delete(header);
            expect(getPPRRequest(headers)).toBeUndefined();
            expect(getPPRRouteType('static', true, getPPRRequest(headers))).toBe('static');
        }
    });

    it('does not opt in when required headers are empty', () => {
        for (const header of [
            'x-gbo-site',
            'x-gbo-site-space',
            'x-gbo-space',
            'x-gbo-site-base-path',
            'x-gbo-base-path',
            'x-gbo-pathname',
            'x-gbo-organization',
            'x-gbo-complete',
            'x-gbo-canonical-url',
            'x-gbo-api-token',
            'x-gbo-revision',
            'x-gbo-revalidation-id',
            'x-gbo-default-site-space',
            'x-gbo-default-space',
        ]) {
            const headers = new Headers(pprHeaders);
            headers.set(header, '');
            expect(getPPRRequest(headers)).toBeUndefined();
        }
    });

    it('does not opt in when boolean headers are invalid', () => {
        for (const header of ['x-gbo-complete', 'x-gbo-preview']) {
            const headers = new Headers(pprHeaders);
            headers.set(header, 'yes');
            expect(getPPRRequest(headers)).toBeUndefined();
        }
    });

    it('reads resolved content from the complete header set', () => {
        expect(getPPRRequest(pprHeaders)).toEqual({
            content: {
                site: 'site-id',
                siteSection: 'site-section-id',
                siteSpace: 'site-space-id',
                space: 'space-id',
                siteBasePath: '/docs',
                basePath: '/docs/guide',
                pathname: '/getting-started',
                organization: 'organization-id',
                shareKey: 'share-key',
                complete: true,
                contextId: 'context-id',
                canonicalUrl: 'https://docs.example.com/guide',
                preview: false,
                revision: 'revision-id',
                changeRequest: 'change-request-id',
                apiToken: 'api-token',
            },
            defaults: {
                siteSection: 'default-site-section-id',
                siteSpace: 'default-site-space-id',
                space: 'default-space-id',
            },
            revalidationId: 'revalidation-id',
        });
    });

    it('treats empty optional headers as absent', () => {
        const headers = new Headers(pprHeaders);
        for (const header of [
            'x-gbo-site-section',
            'x-gbo-share-key',
            'x-gbo-context-id',
            'x-gbo-preview',
            'x-gbo-change-request',
        ]) {
            headers.set(header, '');
        }

        expect(getPPRRequest(headers)?.content).toMatchObject({
            site: 'site-id',
            siteSection: undefined,
            shareKey: undefined,
            contextId: undefined,
            preview: undefined,
            revision: 'revision-id',
            changeRequest: undefined,
        });
    });

    it('accepts an explicitly empty default site section', () => {
        const headers = new Headers(pprHeaders);
        headers.set('x-gbo-default-site-section', '');

        expect(getPPRRequest(headers)?.defaults).toEqual({
            siteSection: undefined,
            siteSpace: 'default-site-space-id',
            space: 'default-space-id',
        });
    });

    it('requires all default location headers before opting into PPR', () => {
        for (const header of [
            'x-gbo-default-site-section',
            'x-gbo-default-site-space',
            'x-gbo-default-space',
        ]) {
            const headers = new Headers(pprHeaders);
            headers.delete(header);
            expect(getPPRRequest(headers)).toBeUndefined();
            expect(getPPRRouteType('static', true, getPPRRequest(headers))).toBe('static');
        }
    });

    it('parses false and true boolean header values', () => {
        const headers = new Headers(pprHeaders);
        headers.set('x-gbo-complete', 'false');
        headers.set('x-gbo-preview', 'true');

        expect(getPPRRequest(headers)?.content).toMatchObject({
            complete: false,
            preview: true,
        });
    });
});
