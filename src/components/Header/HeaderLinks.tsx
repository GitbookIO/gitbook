import React from 'react';

import { tcls } from '@/lib/tailwind';

interface HeaderLinksProps {
    children: React.ReactNode;
}

export async function HeaderLinks({ children }: HeaderLinksProps) {
    return (
        <div
            className={tcls(
                '@container/headerlinks',
                'hidden',
                'sm:flex',
                'justify-end',
                'h-full',
                //hide children
                `[&>*]:hidden`,
                //hide each child per container breakpoint
                `@[440px]/headerlinks:[&>*:nth-last-child(4)]:flex`,
                `@[560px]/headerlinks:[&>*:nth-last-child(3)]:flex`,
                `@[720px]/headerlinks:[&>*:nth-last-child(2)]:flex`,
                `@[868px]/headerlinks:[&>*:nth-last-child(1)]:flex`,
                `[&>*:nth-last-child(n_+_5)]:flex`,
                // show container on larger screens
                `@[320px]:flex`,
            )}
        >
            {children}
        </div>
    );
}
