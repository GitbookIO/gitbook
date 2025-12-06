import React from 'react';

/**
 * Conditionally wrap children in a Suspense component based on SSR status.
 * We need to do that because otherwise ISR pages will trigger the suspense boundary on every request,
 * causing flickering and bad UX.
 */
export default function OptionalSuspense(props: {
    isSSR: boolean;
    fallback: React.ReactNode;
    children: React.ReactNode;
}) {
    const { isSSR, fallback, children } = props;

    if (!isSSR) {
        return <>{children}</>;
    }

    return <React.Suspense fallback={fallback}>{children}</React.Suspense>;
}
