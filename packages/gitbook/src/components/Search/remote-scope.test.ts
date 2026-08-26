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
});
