import { useParams } from 'next/navigation';
import React from 'react';

/**
 * Scroll to the current URL hash everytime the URL changes.
 */
export function useScrollToHash() {
    const params = useParams();

    const scrollToHash = React.useCallback(() => {
        const hash = window.location.hash;
        if (hash) {
            const element = document.getElementById(hash.slice(1));
            if (element) {
                element.scrollIntoView({
                    block: 'start',
                    behavior: 'smooth',
                });
            }
        }
    }, []);

    // With next.js, the hashchange event is not triggered when the hash changes
    // Instead a hack is to use the `useParams` hook to listen to changes in the hash
    // https://github.com/vercel/next.js/discussions/49465#discussioncomment-5845312
    React.useEffect(() => {
        scrollToHash();
    }, [params, scrollToHash]);
}
