import type React from 'react';

import { tcls } from '@/lib/tailwind';

import styles from './headerLinks.module.css';

interface HeaderLinksProps {
    children: React.ReactNode;
}

export async function HeaderLinks({ children }: HeaderLinksProps) {
    return (
        <div
            className={tcls(
                styles.containerHeaderlinks,
                'lg:[&>.button+.button]:-ml-2 z-20 flex min-w-9 shrink grow items-center justify-end gap-x-4 lg:gap-x-6'
            )}
        >
            {children}
        </div>
    );
}
