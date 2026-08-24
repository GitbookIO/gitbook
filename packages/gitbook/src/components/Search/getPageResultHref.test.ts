import { describe, expect, it } from 'bun:test';

import { getPageResultHref, getPageResultPresentation } from './getPageResultHref';

const pageResult = {
    href: '/operations/analyst-guidance/understanding-vectra-ai-detections',
    bestSection: {
        href: '/operations/analyst-guidance/understanding-vectra-ai-detections#please-note',
        title: 'Please note',
        body: 'Individual detections are no longer scored.',
        score: 1,
    },
};

describe('getPageResultHref', () => {
    it('links Vectra page matches to the page root without presenting a section destination', () => {
        expect(getPageResultPresentation({ ...pageResult, resultType: 'page' })).toEqual({
            href: '/operations/analyst-guidance/understanding-vectra-ai-detections',
            preview: { body: 'Individual detections are no longer scored.' },
        });
    });

    it('links Vectra section matches to the matching section and presents its preview', () => {
        expect(getPageResultPresentation({ ...pageResult, resultType: 'section' })).toEqual({
            href: '/operations/analyst-guidance/understanding-vectra-ai-detections#please-note',
            preview: {
                title: 'Please note',
                body: 'Individual detections are no longer scored.',
            },
        });
    });

    it('preserves anchored links when the result type is absent', () => {
        expect(getPageResultHref(pageResult)).toBe(
            '/operations/analyst-guidance/understanding-vectra-ai-detections#please-note'
        );
    });

    it('links to the page when no section preview is available', () => {
        expect(getPageResultHref({ href: '/getting-started', resultType: 'section' })).toBe(
            '/getting-started'
        );
    });

    it('links a section match to its anchor when it only has a heading', () => {
        expect(
            getPageResultHref({
                href: '/getting-started',
                resultType: 'section',
                bestSection: {
                    href: '/getting-started#requirements',
                    title: 'Requirements',
                    score: 1,
                },
            })
        ).toBe('/getting-started#requirements');
    });
});
