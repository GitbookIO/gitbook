import React from 'react';

import { tcls } from '@/lib/tailwind';

import styles from './headerLinks.module.css';

interface HeaderLinksProps {
    children: React.ReactNode;
}

export async function HeaderLinks({ children }: HeaderLinksProps) {
    return (
        <div className={tcls('w-full', 'h-full', 'inline-flex', 'tracking-[-0.02em]')}>
            <div
                className={`${styles.containerHeaderlinks} ${tcls(
                    'flex',
                    'w-full',
                    'h-full',
                    'justify-end',
                    'gap-x-2.5',
                    'mr-2.5',
                    'lg:gap-x-5',
                    '*:max-w-56',
                )}`}
            >
                {children}
            </div>
        </div>
    );
}
