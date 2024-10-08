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
                'flex justify-end items-center gap-x-2.5 mr-2.5 lg:gap-x-5 lg:mr-2.5 *:max-w-56',
            )}
        >
            {children}
        </div>
    );
}
