'use client';

import { useMobileMenuSheet } from '@/components/MobileMenu';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { usePreventScroll } from 'react-aria';

export function MobileMenuScript() {
    const pathname = usePathname();
    const { open, setOpen } = useMobileMenuSheet();

    // biome-ignore lint/correctness/useExhaustiveDependencies: Close the navigation when navigating to a page
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    // Prevent scrolling when the menu is open
    usePreventScroll({
        isDisabled: !open,
    });

    return null;
}
