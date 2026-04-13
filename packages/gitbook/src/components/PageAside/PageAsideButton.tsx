'use client';
import { useLanguage } from '@/intl/client';
import { tString } from '@/intl/translate';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '../primitives';

const globalClassName = 'outline-open';

export function PageAsideToggleButton() {
    const language = useLanguage();

    const pathname = usePathname();

    // Close the navigation when navigating to a page
    useEffect(() => {
        document.body.classList.remove(globalClassName);
    }, [pathname]);

    return (
        <>
            <Button
                icon="block-quote"
                size="xsmall"
                variant="secondary"
                label={tString(language, 'on_this_page')}
                onClick={() => {
                    document.body.classList.toggle(globalClassName);
                }}
                className="layout-default:hidden layout-wide:3xl:hidden page-no-outline:hidden layout-wide:max-xl:hidden page-api-block:min-[96rem]:hidden"
            />
            <Button
                icon="block-quote"
                size="xsmall"
                iconOnly
                variant="secondary"
                label={tString(language, 'on_this_page')}
                onClick={() => {
                    document.body.classList.toggle(globalClassName);
                }}
                className="page-no-outline:hidden xl:hidden"
            />
        </>
    );
}

export function PageAsideCloseButton() {
    return (
        <Button
            icon="xmark"
            size="small"
            iconOnly
            variant="blank"
            onClick={() => {
                document.body.classList.toggle(globalClassName);
            }}
        />
    );
}
