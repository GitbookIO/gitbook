'use client';

import { t, useLanguage } from '@/intl/client';

export function SearchLiveResultsAnnouncer(props: { count: number; showing: boolean }) {
    const { count, showing } = props;
    const language = useLanguage();

    return (
        <div className="sr-only" aria-live="assertive" role="alert" aria-relevant="all">
            {showing
                ? count > 0
                    ? t(language, 'search_results_count', count)
                    : t(language, 'search_no_results')
                : ''}
        </div>
    );
}
