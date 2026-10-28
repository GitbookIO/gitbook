'use client';

import React from 'react';

import { useInViewportListener } from '../hooks/useInViewportListener';

// Dwell before the content counts as seen. In the embed it also absorbs the initial
// `/assistant` render on frames configured without that tab, as `configure` arrives later.
const VISIBLE_DELAY_MS = 500;

// Without a provider the content is always considered visible.
const VisibilityContext = React.createContext(true);

// An iframe can be loaded while its host keeps it hidden, and a non-rendered iframe has a
// zero-sized viewport, which keeps the observer below non-intersecting until it is shown.
export function VisibilityProvider(props: { className: string; children: React.ReactNode }) {
    const { className, children } = props;

    const ref = React.useRef<HTMLDivElement>(null);
    const [visible, setVisible] = React.useState(false);

    const [inViewport, setInViewport] = React.useState(false);
    useInViewportListener(ref, (isIntersecting) => setInViewport(isIntersecting));

    // Latched: an observer inside an iframe also reports the host page scrolling it out of
    // view, and scrolling past an inline embed is not a new view. Remounting is.
    React.useEffect(() => {
        if (!inViewport || visible) {
            return;
        }

        const timeout = setTimeout(() => setVisible(true), VISIBLE_DELAY_MS);
        return () => clearTimeout(timeout);
    }, [inViewport, visible]);

    return (
        <VisibilityContext value={visible}>
            <div ref={ref} className={className}>
                {children}
            </div>
        </VisibilityContext>
    );
}

// Always true outside of a `VisibilityProvider`.
export function useIsVisible() {
    return React.use(VisibilityContext);
}
