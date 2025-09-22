'use client';

import React from 'react';
import { tcls } from '@/lib/tailwind';
import { useIsNavigating } from '../hooks';

interface NavigationLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export const NavigationLoader = React.forwardRef<HTMLDivElement, NavigationLoaderProps>(
    ({ children, className, ...props }, ref) => {
        const isNavigating = useIsNavigating();
        
        return (
            <div 
                ref={ref}
                className={tcls(
                    className,
                    'outline-0',
                    isNavigating ? 'animate-outline' : ''
                )}
                {...props}
            >
                {/* Children content */}
                {children}
            </div>
        );
    }
);

NavigationLoader.displayName = 'NavigationLoader';
