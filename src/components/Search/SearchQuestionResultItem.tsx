import React from 'react';

import { t, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';

export const SearchQuestionResultItem = React.forwardRef(function SearchQuestionResultItem(
    props: {
        query: string;
        active: boolean;
        onClick: () => void;
    },
    ref: React.Ref<HTMLDivElement>,
) {
    const { query, active, onClick } = props;
    const language = useLanguage();

    return (
        <div
            ref={ref}
            onClick={onClick}
            className={tcls(
                'flex',
                'flex-row',
                'rounded',
                'px-6',
                'py-3',
                'hover:bg-dark/1',
                'text-base',
                'text-dark',
                'font-semibold',
                'mt-6',
                'first:mt-0',
                active ? ['bg-primary-50'] : null,
            )}
        >
            {t(language, 'search_ask', [query])}
        </div>
    );
});
