'use client';

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/utils/Sheet';
import { useMobileMenuSheet } from './useMobileMenuSheet';

export function MobileMenuSheet(props: { children: React.ReactNode }) {
    const { children } = props;
    const { open, setOpen } = useMobileMenuSheet();

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent
                aria-label="Mobile menu"
                overlayClassName="lg:hidden"
                className="pb-2 lg:hidden"
            >
                {/** Needed for screen readers */}
                <SheetHeader className="sr-only">
                    <SheetTitle>Table of contents</SheetTitle>
                    <SheetDescription>A list of all the pages in the site.</SheetDescription>
                </SheetHeader>

                {children}
            </SheetContent>
        </Sheet>
    );
}
