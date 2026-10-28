import React from 'react';

/**
 * Hook to check if a component is mounted.
 */
export function useIsMounted() {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    return mounted;
}
