'use client';

import { MAIN_CONTENT_ID } from '../layout';
import { tString, useLanguage } from '@/intl/client';

/**
 * Link shown on keyboard focus to jump over the header and navigation.
 */
export function SkipToContent() {
    const language = useLanguage();
    return (
        <a
            href={`#${MAIN_CONTENT_ID}`}
            className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-tint-base focus:px-4 focus:py-2 focus:text-sm focus:text-tint-strong focus:shadow-lg focus:ring-2 focus:ring-primary"
        >
            {tString(language, 'skip_to_content')}
        </a>
    );
}
