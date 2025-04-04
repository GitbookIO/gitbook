import { create } from 'zustand';

type VisitedPage = {
    spaceId: string;
    pageId: string;
};

/**
 * A store for the pages that have been visited in the current session.
 */
export const useVisitedPages = create<{
    pages: VisitedPage[];
    addPage: (page: VisitedPage) => void;
}>((set) => ({
    pages: [],
    addPage: (page) =>
        set((state) => {
            const lastPage = state.pages[state.pages.length - 1];
            if (lastPage && lastPage.spaceId === page.spaceId && lastPage.pageId === page.pageId) {
                return { pages: state.pages };
            }

            return { pages: [...state.pages, page] };
        }),
}));
