import { atom, useRecoilValue } from 'recoil';

const loadingPageAtom = atom({
    key: 'loadingPage',
    default: false,
    effects: [
        ({ setSelf }) => {
            if (typeof window === 'undefined' || !window.navigation) {
                return;
            }

            window.navigation.addEventListener('navigate', () => {
                // Next.js finished fetching the page and update the URL.
                setSelf(false);
            });

            document.addEventListener('click', (event) => {
                if (event.target.tagName !== 'A') {
                    return;
                }

                // CLick on a <Link> component.
                setSelf(true);
            });
        },
    ],
});

/**
 * Return true if we are loading a new page.
 */
export function useIsLoadingPage(): boolean {
    return useRecoilValue(loadingPageAtom);
}
