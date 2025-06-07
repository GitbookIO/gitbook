'use client';

import { Sheet, SheetContent } from '@/components/utils/Sheet';
import { useMobileMenuSheet } from './useMobileMenuSheet';

export function MobileMenuSheet({ children }: { children: React.ReactNode }) {
    const { open, setOpen } = useMobileMenuSheet();

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent
                aria-label="Mobile menu"
                overlayClassName="lg:hidden"
                className="pt-10 lg:hidden"
            >
                {children}
            </SheetContent>
        </Sheet>
    );
}
