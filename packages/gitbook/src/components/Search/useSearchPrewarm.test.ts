import { describe, expect, it, mock } from 'bun:test';

import { createSearchPrewarmer } from './search-prewarm';

describe('createSearchPrewarmer', () => {
    it('does not prewarm while search remains closed', () => {
        const prewarmSiteSearch = mock(() => Promise.resolve());
        const prewarmer = createSearchPrewarmer(false);

        prewarmer.update(false, prewarmSiteSearch);
        prewarmer.update(false, prewarmSiteSearch);

        expect(prewarmSiteSearch).not.toHaveBeenCalled();
    });

    it('prewarms once when search opens and not again for updates while it remains open', () => {
        const prewarmSiteSearch = mock(() => Promise.resolve());
        const prewarmer = createSearchPrewarmer(false);

        prewarmer.update(true, prewarmSiteSearch);
        prewarmer.update(true, prewarmSiteSearch);
        prewarmer.update(true, prewarmSiteSearch);

        expect(prewarmSiteSearch).toHaveBeenCalledTimes(1);
    });

    it('prewarms again after search closes and reopens', () => {
        const prewarmSiteSearch = mock(() => Promise.resolve());
        const prewarmer = createSearchPrewarmer(false);

        prewarmer.update(true, prewarmSiteSearch);
        prewarmer.update(false, prewarmSiteSearch);
        prewarmer.update(true, prewarmSiteSearch);

        expect(prewarmSiteSearch).toHaveBeenCalledTimes(2);
    });

    it('does not surface a rejected prewarm request', async () => {
        const prewarmSiteSearch = mock(() => Promise.reject(new Error('Prewarm failed')));
        const prewarmer = createSearchPrewarmer(false);

        expect(() => prewarmer.update(true, prewarmSiteSearch)).not.toThrow();
        await Promise.resolve();
        prewarmer.update(false, prewarmSiteSearch);
        expect(() => prewarmer.update(true, prewarmSiteSearch)).not.toThrow();
        await Promise.resolve();

        expect(prewarmSiteSearch).toHaveBeenCalledTimes(2);
    });

    it('does not prewarm when search is already open on initial render', () => {
        const prewarmSiteSearch = mock(() => Promise.resolve());
        const prewarmer = createSearchPrewarmer(true);

        prewarmer.update(true, prewarmSiteSearch);

        expect(prewarmSiteSearch).not.toHaveBeenCalled();
    });
});
