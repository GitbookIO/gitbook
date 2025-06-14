'use client';

import { useMobileMenuSheet } from '@/components/MobileMenu';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export function MobileMenuScript() {
    const pathname = usePathname();
    const { open, setOpen } = useMobileMenuSheet();

    // biome-ignore lint/correctness/useExhaustiveDependencies: Close the navigation when navigating to a page
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    useEffect(() => {
        // If the menu is open, we add a class to the body to prevent scrolling
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [open]);

    return null;
}
