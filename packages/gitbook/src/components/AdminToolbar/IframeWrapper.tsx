'use client';

import React from 'react';

interface IframeWrapperProps {
    children: React.ReactNode;
}

/**
 * Client component that detects if we're in an iframe and conditionally renders children
 */
export function IframeWrapper({ children }: IframeWrapperProps) {
    const [isInIframe, setIsInIframe] = React.useState(false);

    React.useEffect(() => {
        // Check if we're running inside an iframe
        const inIframe = window !== window.parent;
        setIsInIframe(inIframe);
    }, []);

    // Don't render children if we're in an iframe (GitBook app preview)
    if (isInIframe) {
        return null;
    }

    return children;
}
