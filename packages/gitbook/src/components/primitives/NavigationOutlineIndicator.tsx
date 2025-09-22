'use client';

import { tcls } from '@/lib/tailwind';
import React from 'react';
import { useIsNavigating } from '../hooks';

interface NavigationOutlineIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export const NavigationOutlineInndicator = React.forwardRef<
    HTMLDivElement,
    NavigationOutlineIndicatorProps
>(({ children, className, ...props }, ref) => {
    const isNavigating = useIsNavigating();

    return (
        <div
            ref={ref}
            className={tcls(className, 'outline-0', isNavigating ? 'animate-outline' : '')}
            {...props}
        >
            {/* Children content */}
            {children}
        </div>
    );
});

NavigationOutlineInndicator.displayName = 'NavigationLoader';
