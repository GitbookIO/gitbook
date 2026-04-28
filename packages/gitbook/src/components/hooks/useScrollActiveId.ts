import React from 'react';

type SectionIntersectionState = {
    isIntersecting: boolean;
    top: number;
};

export function getActiveSectionId(
    ids: string[],
    sectionStates: Map<string, SectionIntersectionState>
) {
    const visibleSections = ids
        .map((id) => [id, sectionStates.get(id)] as const)
        .filter((entry): entry is readonly [string, SectionIntersectionState] => {
            return Boolean(entry[1]?.isIntersecting);
        });

    if (visibleSections.length === 0) {
        return undefined;
    }

    const firstVisibleBelowTop = visibleSections.find(([, state]) => state.top >= 0);
    if (firstVisibleBelowTop) {
        return firstVisibleBelowTop[0];
    }

    return visibleSections[visibleSections.length - 1]?.[0];
}

/**
 * Get the current ID being scrolled in the page.
 */
export function useScrollActiveId(
    ids: string[],
    {
        rootMargin,
        threshold = 0.5,
        enabled,
    }: {
        rootMargin?: string;
        threshold?: number;
        enabled: boolean;
    } = { enabled: true }
) {
    const [activeId, setActiveId] = React.useState<string>(ids[0]!);
    const sectionStatesRef = React.useRef<Map<string, SectionIntersectionState>>(new Map());

    React.useEffect(() => {
        const defaultActiveId = ids[0];
        // @ts-expect-error
        setActiveId((activeId) => (ids.indexOf(activeId) !== -1 ? activeId : defaultActiveId));
        if (!enabled) {
            return;
        }

        if (typeof IntersectionObserver === 'undefined') {
            return;
        }

        const onObserve: IntersectionObserverCallback = (entries) => {
            entries.forEach((entry) => {
                const sectionId = entry.target.id;
                if (sectionId) {
                    sectionStatesRef.current.set(sectionId, {
                        isIntersecting:
                            entry.isIntersecting && entry.intersectionRatio >= threshold,
                        top: entry.boundingClientRect.top,
                    });
                }
            });

            const nextActiveSection = getActiveSectionId(ids, sectionStatesRef.current);
            if (nextActiveSection) {
                setActiveId(nextActiveSection);
            }
        };

        const observer = new IntersectionObserver(onObserve, {
            rootMargin,
            threshold,
        });

        ids.forEach((id) => {
            try {
                const element = document.getElementById(id);
                if (element) {
                    observer.observe(element);
                }
            } catch (error) {
                console.error('Failed to observe section', error);
            }
        });

        return () => {
            observer.disconnect();
        };
    }, [ids, threshold, rootMargin, enabled]);

    return activeId;
}
