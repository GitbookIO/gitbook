import { describe, expect, it } from 'bun:test';

import { getPublishedContentLookupPlan } from './lookup-plan';

describe('getPublishedContentLookupPlan', () => {
    it('uses a supplied lookup URL directly without generating alternatives', () => {
        expect(
            getPublishedContentLookupPlan({
                url: 'https://docs.example.com/a/b/c',
                urlLookup: 'https://docs.example.com/a',
            })
        ).toEqual({
            urls: [
                {
                    url: 'https://docs.example.com/a',
                    primary: true,
                    extraPath: '',
                },
            ],
            basePath: undefined,
            changeRequest: undefined,
            revision: undefined,
            direct: true,
        });
    });

    it('uses URL alternatives when no direct lookup URL is supplied', () => {
        const plan = getPublishedContentLookupPlan({
            url: 'https://docs.example.com/a/b/c',
        });

        expect(plan.direct).toBeFalse();
        expect(plan.urls.length).toBeGreaterThan(1);
    });
});
