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
                'w-full flex justify-end items-center gap-x-4 lg:gap-x-8 *:max-w-56 z-20',
            )}
        >
            {children}
        </div>
    );
}
