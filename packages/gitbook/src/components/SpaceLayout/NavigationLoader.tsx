'use client';

import { tcls } from '@/lib/tailwind';
import { useIsNavigating } from '../hooks';

interface NavigationLoaderProps {
    children: React.ReactNode;
    className?: string;
}

export function NavigationLoader({ children, className }: NavigationLoaderProps) {
    const isNavigating = useIsNavigating();
    
    return (
        <div className={tcls("relative", className)}>
            {/* Children content */}
            {children}
            
            {/* Animated loading overlay */}
            {isNavigating && (
                <div
                className={tcls(
                    'absolute',
                    'inset-0',
                    '-m-0.5', // Make it a few px bigger than children
                    'rounded-lg',
                    'overflow-hidden',
                    'pointer-events-none'
                )}
            >
                {/* Animated circular gradient background */}
                <div
                    className={tcls(
                        'absolute',
                        'inset-0',
                        'bg-primary-original',
                        'animate-spin',
                    )}
                    style={{animationDuration: '2s'}}
                />
            </div>)}
        </div>
    );
}
