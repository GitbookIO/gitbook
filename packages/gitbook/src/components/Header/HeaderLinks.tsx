import type React from 'react';

import { type ClassValue, tcls } from '@/lib/tailwind';

import styles from './headerLinks.module.css';

interface HeaderLinksProps {
    children: React.ReactNode;
    style?: ClassValue;
}

export async function HeaderLinks({ children, style }: HeaderLinksProps) {
    return (
        <div
            className={tcls(
                styles.containerHeaderlinks,
                'lg:[&>.button+.button]:-ml-2 z-20 flex min-w-9 flex-1 items-center justify-end gap-x-4 lg:gap-x-6',
                style
            )}
        >
            {children}
        </div>
    );
}
