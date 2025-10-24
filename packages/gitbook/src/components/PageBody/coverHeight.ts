import type { RevisionPageDocumentCover } from '@gitbook/api';

export const DEFAULT_COVER_HEIGHT = 240;
export const MIN_COVER_HEIGHT = 10;
export const MAX_COVER_HEIGHT = 700;

type CoverWithHeight = RevisionPageDocumentCover & { height?: number | null };

export function clampCoverHeight(value: number): number {
    return Math.min(MAX_COVER_HEIGHT, Math.max(MIN_COVER_HEIGHT, value));
}

export function normalizeCoverHeight(height: number | null | undefined): number {
    if (typeof height !== 'number' || Number.isNaN(height)) {
        return DEFAULT_COVER_HEIGHT;
    }

    return clampCoverHeight(height);
}

export function getCoverHeight(cover: RevisionPageDocumentCover | null | undefined): number {
    if (!cover) {
        return 0;
    }

    return normalizeCoverHeight((cover as CoverWithHeight).height);
}

export function hasVisibleCover(cover: RevisionPageDocumentCover | null | undefined): boolean {
    return getCoverHeight(cover) > 0;
}
