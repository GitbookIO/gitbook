'use client';

import { useScrollToHash } from '@/components/hooks';

/**
 * Client component to initialize interactivity for a page.
 */
export function PageClientLayout(props: {}) {
    // We use this hook in the page layout to ensure the elements for the blocks
    // are rendered before we scroll to the hash.
    useScrollToHash();
    return null;
}
