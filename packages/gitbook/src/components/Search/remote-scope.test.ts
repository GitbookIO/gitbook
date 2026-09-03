import { describe, expect, it } from 'bun:test';

import { computeRemoteSearchScope } from './remote-scope';

describe('computeRemoteSearchScope', () => {
    it('requests one globally ranked result set for a multi-section default search', () => {
        expect(
            computeRemoteSearchScope('default', 'snyk-discover', [
                'snyk-discover',
                'snyk-developer-tools',
            ])
        ).toEqual({
            mode: 'current',
            siteSpaceId: 'snyk-discover',
        });
    });

    it('requests only the site spaces belonging to an independently selected section', () => {
        expect(
            computeRemoteSearchScope(
                'extended',
                'snyk-discover',
                ['snyk-discover', 'snyk-developer-tools'],
                ['snyk-api-v1', 'snyk-api-v2']
            )
        ).toEqual({
            mode: 'specific',
            siteSpaceIds: ['snyk-api-v1', 'snyk-api-v2'],
        });
    });
});
