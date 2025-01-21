import React from 'react';

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
                'grow shrink flex justify-end items-center gap-x-4 lg:gap-x-6 min-w-9 z-20 [&>.button+.button]:-ml-3',
            )}
        >
            {children}
        </div>
    );
}
