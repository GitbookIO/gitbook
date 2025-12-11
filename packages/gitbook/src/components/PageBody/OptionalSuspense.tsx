import React from 'react';

/**
 * Conditionally wrap children in a Suspense component based on SSR status.
 * We need to do that because otherwise ISR pages will trigger the suspense boundary on every request,
 * causing flickering and bad UX.
 */
export default function OptionalSuspense(props: {
    staticRoute: boolean;
    fallback: React.ReactNode;
    children: React.ReactNode;
}) {
    const { staticRoute, fallback, children } = props;

    if (staticRoute) {
        return <>{children}</>;
    }

    return <React.Suspense fallback={fallback}>{children}</React.Suspense>;
}
