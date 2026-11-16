import type React from 'react';

import { type ClassValue, cx } from '@/lib/classnames';

interface HeaderLinksProps {
    children: React.ReactNode;
    style?: ClassValue;
}

export async function HeaderLinks({ children, style }: HeaderLinksProps) {
    return <nav className={cx('header-links', style)}>{children}</nav>;
}
