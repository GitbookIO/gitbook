'use client';
import * as React from 'react';
import { useEventCallback } from 'usehooks-ts';
import { useScrollListener } from './useScrollListener';

/**
 * Hook that returns the active section key of the page.
 * The active section is the section that is currently visible on the viewport.
 *
 * Here's a diagram: https://user-images.githubusercontent.com/8937991/206921462-14e5b8b7-5a19-4c8b-912d-ed1f17710bc4.png
 */
export function usePageActiveSections(
    ids: string[],
    scrollRef: React.RefObject<HTMLElement | Window | null>
): string[] {
    const [activeSections, setActiveSections] = React.useState<string[]>(noActiveSections);

    const update = useEventCallback(() => {
        const element = scrollRef.current;
        if (element) {
            const rect =
                element instanceof Window
                    ? new DOMRect(0, 0, window.innerWidth, window.innerHeight)
                    : element.getBoundingClientRect();
            const activeSections = findActiveSectionIds({
                ids,
                containerRect: rect,
            });
            setActiveSections((previous) => {
                if (activeSections.length !== previous.length) {
                    return activeSections;
                }
                if (activeSections.some((key, i) => key !== previous[i])) {
                    return activeSections;
                }
                return previous;
            });
        }
    });

    useScrollListener(update, scrollRef);

    React.useEffect(() => {
        update();
    }, [update]);

    return activeSections;
}

const noActiveSections: string[] = [];

// We consider anything in [-MARGINpx; +MARGINpx] to be at the boundary
const MARGIN = 24;

/**
 * findActiveSectionIndex finds the section that is in the window's view
 * it uses binary-search to efficiently (minimize DOM queries)
 * find the DOM node whose .top is closest to but below `0` (the window's top)
 */
function findActiveSectionIndex(ids: string[], scrollTop: number): number {
    const N = ids.length;
    // Number of max iterations to find the element (so our search is bounded)
    // in theory, at most floor(log(n)+1) steps to find the specific element
    const maxIterations = Math.floor(Math.log2(N) + 1);
    // Our binary search variables
    let start = 0;
    let end = N - 1;
    let mid = Math.ceil((start + end) / 2);
    let idx = -1;
    let y: number | null = null;
    for (let i = 0; i < maxIterations; i++) {
        const id = ids[mid];
        // Double check that we have a section, else exit
        if (!id) {
            return -1;
        }
        const element = document.getElementById(id);
        const sy = element ? element.getBoundingClientRect().top - scrollTop : null;
        if (sy === null || sy > MARGIN) {
            // Go left
            end = mid;
            mid = Math.floor((start + end) / 2);
        } else if (sy >= -MARGIN && sy <= MARGIN) {
            // Hit
            return mid;
        } else if (sy < MARGIN) {
            // If bigger than previous (but still smaller than 0)
            // that becomes our new active index
            if (y === null || sy > y) {
                y = sy;
                idx = mid;
            }
            // Go right
            start = mid;
            mid = Math.ceil((start + end) / 2);
        }
    }
    return idx;
}

/**
 * Find the active sections in the viewport.
 */
function findActiveSectionIds(input: {
    ids: string[];
    containerRect: DOMRect;
}): string[] {
    const activeIndex = findActiveSectionIndex(input.ids, input.containerRect.top);

    // Check if the next sections are visible, stop when they are not.
    const activeSections: string[] = input.ids[activeIndex] ? [input.ids[activeIndex]] : [];

    for (let i = activeIndex + 1; i < input.ids.length; i++) {
        const id = input.ids[i];
        const element = document.getElementById(id);
        if (!element) {
            continue;
        }

        const rect = element.getBoundingClientRect();
        if (rect.bottom + MARGIN > input.containerRect.bottom) {
            break;
        }

        activeSections.push(id);
    }
    return activeSections;
}
