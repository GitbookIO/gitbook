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
                '@4xl:[&>.button+.button]:-ml-2 z-20 ml-auto flex min-w-9 shrink grow @7xl:grow-0 items-center justify-end @4xl:gap-x-6 gap-x-4',
                style
            )}
        >
            {children}
        </div>
    );
}
