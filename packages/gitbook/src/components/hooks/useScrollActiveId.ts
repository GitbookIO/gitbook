import React from 'react';

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
    const sectionsIntersectingMap = React.useRef<Map<string, boolean>>(new Map());

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
            /**
             * We need to keep track of all the sections that are intersecting
             * the viewport. This is because we want to find the first section
             * that is visible on the viewport.
             */
            entries.forEach((entry) => {
                const sectionId = entry.target.id;
                if (sectionId) {
                    sectionsIntersectingMap.current.set(
                        sectionId,
                        entry.isIntersecting && entry.intersectionRatio >= threshold
                    );
                }
            });

            /**
             * Find the first section that is intersecting the viewport (is visible)
             */
            const firstActiveSection = Array.from(sectionsIntersectingMap.current.entries()).find(
                ([, isIntersecting]) => isIntersecting
            );

            if (firstActiveSection) {
                setActiveId(firstActiveSection[0]);
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
