import { describe, expect, it } from 'bun:test';

import { getPageResultHref, getPageResultPresentation } from './getPageResultHref';

const pageResult = {
    href: '/operations/analyst-guidance/understanding-vectra-ai-detections',
    description: 'Learn how Vectra AI detections help analysts investigate threats.',
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
            description: 'Learn how Vectra AI detections help analysts investigate threats.',
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
        expect(
            getPageResultPresentation({
                href: '/getting-started',
                description: 'Start using the product.',
                resultType: 'section',
            })
        ).toEqual({
            href: '/getting-started',
            description: 'Start using the product.',
            preview: undefined,
        });
    });

    it('links a section match to its anchor and presents its heading without the page description', () => {
        expect(
            getPageResultPresentation({
                href: '/getting-started',
                description: 'Start using the product.',
                resultType: 'section',
                bestSection: {
                    href: '/getting-started#requirements',
                    title: 'Requirements',
                    score: 1,
                },
            })
        ).toEqual({
            href: '/getting-started#requirements',
            description: undefined,
            preview: {
                title: 'Requirements',
                body: undefined,
            },
        });
    });

    it('does not replace an empty page description with arbitrary section content', () => {
        expect(
            getPageResultPresentation({ ...pageResult, description: '', resultType: 'page' })
        ).toEqual({
            href: '/operations/analyst-guidance/understanding-vectra-ai-detections',
            description: '',
        });
    });
});
