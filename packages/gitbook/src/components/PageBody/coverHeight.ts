import type { RevisionPageDocumentCover } from '@gitbook/api';

export const DEFAULT_COVER_HEIGHT = 240;
export const MIN_COVER_HEIGHT = 10;
export const MAX_COVER_HEIGHT = 700;

// Normalize and clamp the cover height between the minimum and maximum heights
function clampCoverHeight(height: number | null | undefined): number {
    if (typeof height !== 'number' || Number.isNaN(height)) {
        return DEFAULT_COVER_HEIGHT;
    }

    return Math.min(MAX_COVER_HEIGHT, Math.max(MIN_COVER_HEIGHT, height));
}

// When a user set a custom cover height, we return the clamped cover height. If no height is set, we want to preserve the existing logic for sizing of the cover image and return `undefined` for height.
export function getCoverHeight(
    cover: RevisionPageDocumentCover | null | undefined
): number | undefined {
    // Cover (and thus height) is not defined
    if (!cover || !cover.height) {
        return undefined;
    }

    return clampCoverHeight((cover as RevisionPageDocumentCover).height ?? DEFAULT_COVER_HEIGHT);
}
