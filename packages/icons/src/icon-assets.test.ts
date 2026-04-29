import { describe, expect, it } from 'bun:test';

import { collectNormalizedIconAssets, createMetricsManifest } from '../bin/icon-assets.js';
import { getKitPath } from '../bin/kit.js';

const regularAssetsPromise = collectNormalizedIconAssets(getKitPath(), ['regular']);

async function getRegularAsset(icon: string) {
    const assets = await regularAssetsPromise;
    const asset = assets.find((candidate) => candidate.icon === icon);

    if (!asset) {
        throw new Error(`Missing regular asset for "${icon}"`);
    }

    return asset;
}

describe('icon asset normalization', () => {
    it('keeps the original viewBox while expanding jar to include the overshoot', async () => {
        const jar = await getRegularAsset('jar');

        expect(jar.originalViewBox).toEqual([0, 0, 320, 512]);
        expect(jar.safeViewBox).toEqual([0, -32, 320, 544]);
        expect(jar.svg).toContain('viewBox="0 -32 320 544"');
    });

    it('captures diagonal overflow for arrow-archery', async () => {
        const arrowArchery = await getRegularAsset('arrow-archery');

        expect(arrowArchery.originalViewBox).toEqual([0, 0, 576, 512]);
        expect(arrowArchery.safeViewBox).toEqual([0, -39.9928, 584.5055, 583.8523]);
    });

    it('only emits metrics for icons that need adjusted bounds', async () => {
        const manifest = createMetricsManifest(await regularAssetsPromise);

        expect(manifest['regular/jar']).toEqual({
            originalViewBox: [0, 0, 320, 512],
            safeViewBox: [0, -32, 320, 544],
        });
        expect(manifest['regular/circle-info']).toBeUndefined();
    });
});
