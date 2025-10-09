import type { RevisionPageDocumentCover } from '@gitbook/api';

export const DEFAULT_COVER_HEIGHT = 240;
export const MIN_COVER_HEIGHT = 0;
export const MAX_COVER_HEIGHT = 500;

type CoverWithHeight = RevisionPageDocumentCover & { coverHeight?: number | null };

export function normalizeCoverHeight(height: number | null | undefined): number {
    if (typeof height !== 'number' || Number.isNaN(height)) {
        return DEFAULT_COVER_HEIGHT;
    }

    return Math.min(Math.max(height, MIN_COVER_HEIGHT), MAX_COVER_HEIGHT);
}

export function getCoverHeight(cover: RevisionPageDocumentCover | null | undefined): number {
    if (!cover) {
        return 0;
    }

    return normalizeCoverHeight((cover as CoverWithHeight).coverHeight);
}

export function hasVisibleCover(cover: RevisionPageDocumentCover | null | undefined): boolean {
    return getCoverHeight(cover) > 0;
}
