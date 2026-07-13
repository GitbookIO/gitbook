import type { DocumentTableViewCards } from '@gitbook/api';

// TODO: Remove this local augmentation once `@gitbook/api` ships the `wrap` option on the
// cards view. Until the API lands we mock the field here so the GBO renderer can be built
// ahead of it. The runtime read lives in `isCardsCarousel`, so swapping the mock for the
// real type is a one-file change.
declare module '@gitbook/api' {
    interface DocumentTableViewCards {
        /**
         * Whether the cards wrap into a grid (the default) or lay out as a single
         * horizontally-scrolling row. Defaults to `true` (wrapping grid); `false` renders
         * the carousel.
         */
        wrap?: boolean;
    }
}

/** Whether a cards view should render as a horizontally-scrolling carousel row. */
export function isCardsCarousel(view: DocumentTableViewCards): boolean {
    // TEMPORARY (testing only): default every cards block to the carousel so it can be
    // exercised on a branch before any content sets `wrap`. Revert to `view.wrap === false`
    // before merging so the real default (a wrapping grid) is restored.
    return view.wrap !== true;
}
